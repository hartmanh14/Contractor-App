import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeProject(req, res) {
  const { name, address, description, budget, photos = [] } = req.body;

  try {
    // Build message content — prepend any uploaded photos for vision analysis
    const content = [];

    for (const photo of photos) {
      if (!photo.base64) continue;
      const base64Data = photo.base64.includes(",") ? photo.base64.split(",")[1] : photo.base64;
      content.push({
        type: "image",
        source: { type: "base64", media_type: photo.mimeType || "image/jpeg", data: base64Data },
      });
      if (photo.caption) {
        content.push({ type: "text", text: `Photo caption: ${photo.caption}` });
      }
    }

    content.push({
      type: "text",
      text: `You are a licensed general contractor and building code expert. Analyze the construction project below and return ONLY a valid JSON object — no markdown, no commentary.

Project Name: ${name}
Address: ${address}
Description: ${description}
Budget: $${budget}

Return this exact JSON structure:
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
- regionalCodes: 4–6 codes relevant to the address region (IRC, IBC, NEC, local amendments). Derive state/region from the address.
- materials: 8–14 primary materials with realistic current market quantities and unit costs.
- costEstimate: realistic low/high range for this region and project scope, broken down by trade/category.
- designOptions: exactly 3 distinct styles suited to this project type (e.g. Modern, Traditional, Industrial). For imagePrompt, write a highly detailed photorealistic interior/exterior architectural rendering prompt (at least 40 words) that DALL-E can use to generate the design visual.`,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    });

    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model did not return valid JSON");
    const analysis = JSON.parse(jsonMatch[0]);

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
