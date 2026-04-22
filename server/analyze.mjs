import OpenAI from "openai";
import { extractStructured, photosToContent } from "./lib/anthropic.mjs";

const SYSTEM_PROMPT = `You are a licensed general contractor and building code expert. Given a construction project description, location, and any supplied site photos, produce a realistic project analysis including applicable building codes, a primary materials list, a banded cost estimate, and three distinct design directions.

Derive the jurisdiction from the address. Use IRC, IBC, NEC, IPC, IMC, and locally amended codes where relevant. Use current market prices and typical regional labor rates. Keep design options architecturally coherent with the project type.`;

const SCHEMA = {
  type: "object",
  required: ["regionalCodes", "materials", "costEstimate", "designOptions"],
  properties: {
    regionalCodes: {
      type: "array", minItems: 4, maxItems: 6,
      items: {
        type: "object",
        required: ["code", "title", "description", "category"],
        properties: {
          code: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
        },
      },
    },
    materials: {
      type: "array", minItems: 8,
      items: {
        type: "object",
        required: ["item", "quantity", "unit", "estimatedCost", "category"],
        properties: {
          item: { type: "string" },
          quantity: { type: "string" },
          unit: { type: "string" },
          estimatedCost: { type: "number" },
          category: { type: "string" },
        },
      },
    },
    costEstimate: {
      type: "object",
      required: ["breakdown", "totalLow", "totalHigh", "notes"],
      properties: {
        breakdown: {
          type: "array", minItems: 4,
          items: {
            type: "object",
            required: ["category", "low", "high"],
            properties: {
              category: { type: "string" },
              low: { type: "number" },
              high: { type: "number" },
            },
          },
        },
        totalLow: { type: "number" },
        totalHigh: { type: "number" },
        notes: { type: "string" },
      },
    },
    designOptions: {
      type: "array", minItems: 3, maxItems: 3,
      items: {
        type: "object",
        required: ["title", "style", "description", "highlights", "estimatedCostAdder", "imagePrompt"],
        properties: {
          title: { type: "string" },
          style: { type: "string" },
          description: { type: "string" },
          highlights: { type: "array", minItems: 3, items: { type: "string" } },
          estimatedCostAdder: { type: "number" },
          imagePrompt: { type: "string" },
        },
      },
    },
  },
};

export async function analyzeProject(req, res) {
  const { name, address, description, budget, photos = [] } = req.body;

  try {
    const userContent = [
      ...photosToContent(photos),
      {
        type: "text",
        text: `Project Name: ${name}\nAddress: ${address}\nDescription: ${description}\nBudget: $${budget}\n\nReturn 4–6 regional codes, 8–14 materials with realistic quantities and costs, a banded cost estimate broken down by trade/phase, and exactly 3 distinct design options. For each design option's imagePrompt, write at least 40 words of photorealistic architectural rendering detail suitable for DALL-E.`,
      },
    ];

    const analysis = await extractStructured({
      system: SYSTEM_PROMPT,
      userContent,
      schema: SCHEMA,
      toolName: "submit_project_analysis",
      toolDescription: "Submit the regional codes, materials, cost estimate, and design options for this construction project.",
    });

    // Generate design visuals if OpenAI key is present
    if (process.env.OPENAI_API_KEY && analysis.designOptions?.length) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const imageResults = await Promise.allSettled(
        analysis.designOptions.map(opt =>
          openai.images.generate({
            model: "dall-e-3",
            prompt: opt.imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
          })
        )
      );
      analysis.designOptions = analysis.designOptions.map((opt, i) => ({
        ...opt,
        imageUrl: imageResults[i].status === "fulfilled" ? imageResults[i].value.data[0].url : null,
      }));
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
