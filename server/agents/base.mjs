import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const OUTPUT_SCHEMA = `Return ONLY a valid JSON object — no markdown, no commentary:
{
  "regionalCodes": [
    { "code": "string", "title": "string", "description": "string", "category": "string" }
  ],
  "materials": [
    { "item": "string", "quantity": "string", "unit": "string", "estimatedCost": number, "category": "string" }
  ],
  "costEstimate": {
    "breakdown": [
      { "category": "string", "low": number, "high": number }
    ],
    "totalLow": number,
    "totalHigh": number,
    "notes": "string"
  },
  "designOptions": [
    {
      "title": "string",
      "style": "string",
      "description": "string",
      "highlights": ["string", "string", "string"],
      "estimatedCostAdder": number,
      "imagePrompt": "string"
    }
  ]
}

Rules:
- regionalCodes: 4–6 codes specific to this trade and region. Derive state/region from the address.
- materials: 8–14 primary materials with realistic current market quantities and unit costs.
- costEstimate: realistic low/high range for this region and scope, broken down by trade/phase.
- designOptions: exactly 3 distinct styles suited to this trade and project. For imagePrompt, write a highly detailed photorealistic architectural rendering prompt (at least 40 words) for DALL-E.`;

export async function runAgentAnalysis(systemPrompt, { name, address, description, budget, photos = [] }) {
  const content = [];

  for (const photo of photos) {
    if (!photo.base64) continue;
    const base64Data = photo.base64.includes(",") ? photo.base64.split(",")[1] : photo.base64;
    content.push({
      type: "image",
      source: { type: "base64", media_type: photo.mimeType || "image/jpeg", data: base64Data },
    });
    if (photo.caption) content.push({ type: "text", text: `Photo: ${photo.caption}` });
  }

  content.push({
    type: "text",
    text: `Project: ${name}\nAddress: ${address}\nDescription: ${description}\nBudget: $${budget}\n\n${OUTPUT_SCHEMA}`,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content }],
  });

  const text = message.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Agent did not return valid JSON");
  return JSON.parse(jsonMatch[0]);
}

export async function generateDesignImages(analysis) {
  if (!process.env.OPENAI_API_KEY || !analysis.designOptions?.length) return analysis;
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
