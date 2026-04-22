import OpenAI from "openai";
import { extractStructured, photosToContent } from "../lib/anthropic.mjs";

const ANALYSIS_SCHEMA = {
  type: "object",
  required: ["regionalCodes", "materials", "costEstimate", "designOptions"],
  properties: {
    regionalCodes: {
      type: "array",
      minItems: 4,
      maxItems: 6,
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
      type: "array",
      minItems: 8,
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
          type: "array",
          minItems: 4,
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
      type: "array",
      minItems: 3,
      maxItems: 3,
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

const USAGE_GUIDE = `Guidance:
- regionalCodes: 4–6 codes specific to this trade and region. Derive state/region from the address.
- materials: 8–14 primary materials with realistic current market quantities and unit costs.
- costEstimate: realistic low/high range for this region and scope, broken down by trade/phase.
- designOptions: exactly 3 distinct styles suited to this trade and project. For imagePrompt, write a highly detailed photorealistic architectural rendering prompt (at least 40 words) for DALL-E.`;

export async function runAgentAnalysis(systemPrompt, { name, address, description, budget, photos = [] }) {
  const userContent = [
    ...photosToContent(photos),
    {
      type: "text",
      text: `Project: ${name}\nAddress: ${address}\nDescription: ${description}\nBudget: $${budget}\n\n${USAGE_GUIDE}`,
    },
  ];

  return await extractStructured({
    system: systemPrompt,
    userContent,
    schema: ANALYSIS_SCHEMA,
    toolName: "submit_project_analysis",
    toolDescription: "Submit the regional codes, materials, cost estimate, and design options for this construction project.",
  });
}

export async function generateDesignImages(analysis) {
  if (!process.env.OPENAI_API_KEY || !analysis?.designOptions?.length) return analysis;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const results = await Promise.allSettled(
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
    imageUrl: results[i].status === "fulfilled" ? results[i].value.data[0].url : null,
  }));
  return analysis;
}
