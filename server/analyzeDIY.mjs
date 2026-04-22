import OpenAI from "openai";
import { extractStructured, photosToContent } from "./lib/anthropic.mjs";

const SYSTEM_PROMPT = `You are an expert DIY home-improvement instructor helping a homeowner with limited experience complete a project safely and efficiently. Write clearly, avoid jargon, and be explicit about safety.

Break every project into 5–10 ordered steps a total beginner can follow. Prefer tools most households already own; only mark expensive single-use tools as "rent." Call out warnings on any step that involves water shut-off, electrical work, climbing, sharp tools, fumes, or load-bearing modifications.`;

const SCHEMA = {
  type: "object",
  required: ["difficulty", "difficultyReason", "totalTimeHours", "timeBreakdown", "estimatedTotalCost", "materials", "tools", "steps", "tips", "safetyNotes", "imagePrompt"],
  properties: {
    difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
    difficultyReason: { type: "string" },
    totalTimeHours: { type: "number" },
    timeBreakdown: { type: "string" },
    estimatedTotalCost: { type: "number" },
    materials: {
      type: "array", minItems: 3,
      items: {
        type: "object",
        required: ["item", "qty", "unit", "cost", "store"],
        properties: {
          item: { type: "string" },
          qty: { type: "string" },
          unit: { type: "string" },
          cost: { type: "number" },
          store: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
    tools: {
      type: "array",
      items: {
        type: "object",
        required: ["item", "action", "cost"],
        properties: {
          item: { type: "string" },
          action: { type: "string", enum: ["have", "buy", "rent"] },
          cost: { type: "number" },
          notes: { type: "string" },
        },
      },
    },
    steps: {
      type: "array", minItems: 5, maxItems: 10,
      items: {
        type: "object",
        required: ["number", "title", "timeMinutes", "description", "tips"],
        properties: {
          number: { type: "number" },
          title: { type: "string" },
          timeMinutes: { type: "number" },
          description: { type: "string" },
          tips: { type: "string" },
          warning: { type: ["string", "null"] },
        },
      },
    },
    tips: { type: "array", items: { type: "string" } },
    safetyNotes: { type: "array", items: { type: "string" } },
    imagePrompt: { type: "string" },
  },
};

export async function analyzeDIY(req, res) {
  const { name, description, room, budget, photos = [] } = req.body;

  try {
    const userContent = [
      ...photosToContent(photos),
      {
        type: "text",
        text: `Project: ${name}\nRoom/Area: ${room || "not specified"}\nDescription: ${description}\nBudget: $${budget || "flexible"}\n\nGenerate a complete DIY plan. For imagePrompt, describe the beautiful finished result (not the process) in at least 40 words of photorealistic detail.`,
      },
    ];

    const analysis = await extractStructured({
      system: SYSTEM_PROMPT,
      userContent,
      schema: SCHEMA,
      toolName: "submit_diy_plan",
      toolDescription: "Submit the complete DIY project plan with materials, tools, steps, safety notes, and a finished-result image prompt.",
    });

    if (process.env.OPENAI_API_KEY && analysis.imagePrompt) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const result = await openai.images.generate({
          model: "dall-e-3",
          prompt: analysis.imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
        analysis.imageUrl = result.data[0].url;
      } catch {
        analysis.imageUrl = null;
      }
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error("DIY analysis error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
