import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeDIY(req, res) {
  const { name, description, room, budget, photos = [] } = req.body;

  try {
    const content = [];

    for (const photo of photos) {
      if (!photo.base64) continue;
      const base64Data = photo.base64.includes(",") ? photo.base64.split(",")[1] : photo.base64;
      content.push({ type: "image", source: { type: "base64", media_type: photo.mimeType || "image/jpeg", data: base64Data } });
      if (photo.caption) content.push({ type: "text", text: `Photo caption: ${photo.caption}` });
    }

    content.push({
      type: "text",
      text: `You are an expert DIY home improvement instructor helping a homeowner with limited experience complete a project safely and efficiently. Return ONLY valid JSON — no markdown, no commentary.

Project: ${name}
Room/Area: ${room || "not specified"}
Description: ${description}
Budget: $${budget || "flexible"}

Return exactly this JSON structure:
{
  "difficulty": "beginner" | "intermediate" | "advanced",
  "difficultyReason": "1 sentence explaining why",
  "totalTimeHours": number,
  "timeBreakdown": "string - e.g. '2 hrs active work + 3 hrs drying time'",
  "estimatedTotalCost": number,
  "materials": [
    { "item": "string", "qty": "string", "unit": "string", "cost": number, "store": "string - department at home improvement store", "notes": "string - optional tip" }
  ],
  "tools": [
    { "item": "string", "action": "have" | "buy" | "rent", "cost": number, "notes": "string - optional" }
  ],
  "steps": [
    { "number": number, "title": "string", "timeMinutes": number, "description": "string - detailed plain-English instructions a beginner can follow", "tips": "string - one pro tip for this step", "warning": "string | null - safety or quality warning" }
  ],
  "tips": ["string - general pro tips and common mistakes to avoid"],
  "safetyNotes": ["string - safety considerations"],
  "imagePrompt": "string - detailed photorealistic DALL-E prompt showing the beautiful finished result (40+ words)"
}

Rules:
- materials: list everything including prep supplies (tape, cloths, sandpaper, etc.)
- tools: mark 'have' for items most households own, 'buy' for project-specific tools under $30, 'rent' for expensive tools used only once
- steps: 5–10 actionable steps a beginner can follow without prior knowledge; be specific
- imagePrompt: describe the finished, polished result — not the process`,
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

    if (process.env.OPENAI_API_KEY && analysis.imagePrompt) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const result = await openai.images.generate({ model: "dall-e-3", prompt: analysis.imagePrompt, n: 1, size: "1024x1024", quality: "standard" });
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
