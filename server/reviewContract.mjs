import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function reviewContract(req, res) {
  const { contractText, projectType, projectBudget, contractorName, contractorTrade } = req.body;

  if (!contractText?.trim()) {
    return res.status(400).json({ success: false, error: "Contract text is required." });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `You are a construction law expert and licensed general contractor protecting an inexperienced homeowner/owner-builder from costly mistakes. Analyze this contractor quote or contract thoroughly. Return ONLY valid JSON — no markdown, no commentary.

Project Type: ${projectType || "Home renovation"}
Estimated Budget: $${projectBudget || "not specified"}
Contractor: ${contractorName || "not specified"} (${contractorTrade || "General"})

Contract / Quote Text:
---
${contractText}
---

Return exactly this JSON structure:
{
  "riskScore": "low" | "medium" | "high",
  "riskSummary": "1-2 sentence plain-English verdict on the overall risk level and key concerns",
  "redFlags": [
    {
      "severity": "high" | "medium" | "low",
      "issue": "Brief name of the problem",
      "why": "Why this matters for the homeowner in plain English — no jargon",
      "action": "Exactly what the homeowner should say or do to fix this"
    }
  ],
  "missingClauses": [
    {
      "clause": "Clause name",
      "why": "Why this clause protects the homeowner",
      "suggestedLanguage": "Exact contract language to request be added"
    }
  ],
  "paymentAnalysis": {
    "structure": "Describe the payment terms as stated in the document",
    "recommended": "What the payment schedule should look like for this type and scale of work",
    "concerns": ["List any payment-related concerns"]
  },
  "priceAssessment": {
    "verdict": "reasonable" | "high" | "low" | "unclear",
    "notes": "Context on whether the price seems fair for this scope, trade, and typical regional rates"
  },
  "negotiationPoints": ["Specific items to push back on or request before signing"],
  "requiredBeforeSigning": ["Documents or verifications the homeowner must obtain before signing"],
  "overallAdvice": "2-3 sentence plain-English recommendation on whether and how to proceed safely"
}`,
      }],
    });

    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model did not return valid JSON");
    const review = JSON.parse(jsonMatch[0]);

    res.json({ success: true, review });
  } catch (err) {
    console.error("Contract review error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
