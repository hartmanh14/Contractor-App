import { extractStructured } from "./lib/anthropic.mjs";

const SYSTEM_PROMPT = `You are a construction law expert and licensed general contractor protecting an inexperienced homeowner/owner-builder from costly mistakes. When given a contractor quote or contract, analyze it thoroughly and flag every realistic risk.

Write for a non-lawyer: plain English, no jargon, concrete actions. Be specific — if a clause is missing, quote the exact language to request. If a price seems off for the region and scope, say so and explain why.`;

const SCHEMA = {
  type: "object",
  required: ["riskScore", "riskSummary", "redFlags", "missingClauses", "paymentAnalysis", "priceAssessment", "negotiationPoints", "requiredBeforeSigning", "overallAdvice"],
  properties: {
    riskScore: { type: "string", enum: ["low", "medium", "high"] },
    riskSummary: { type: "string" },
    redFlags: {
      type: "array",
      items: {
        type: "object",
        required: ["severity", "issue", "why", "action"],
        properties: {
          severity: { type: "string", enum: ["high", "medium", "low"] },
          issue: { type: "string" },
          why: { type: "string" },
          action: { type: "string" },
        },
      },
    },
    missingClauses: {
      type: "array",
      items: {
        type: "object",
        required: ["clause", "why", "suggestedLanguage"],
        properties: {
          clause: { type: "string" },
          why: { type: "string" },
          suggestedLanguage: { type: "string" },
        },
      },
    },
    paymentAnalysis: {
      type: "object",
      required: ["structure", "recommended", "concerns"],
      properties: {
        structure: { type: "string" },
        recommended: { type: "string" },
        concerns: { type: "array", items: { type: "string" } },
      },
    },
    priceAssessment: {
      type: "object",
      required: ["verdict", "notes"],
      properties: {
        verdict: { type: "string", enum: ["reasonable", "high", "low", "unclear"] },
        notes: { type: "string" },
      },
    },
    negotiationPoints: { type: "array", items: { type: "string" } },
    requiredBeforeSigning: { type: "array", items: { type: "string" } },
    overallAdvice: { type: "string" },
  },
};

export async function reviewContract(req, res) {
  const { contractText, projectType, projectBudget, contractorName, contractorTrade } = req.body;

  if (!contractText?.trim()) {
    return res.status(400).json({ success: false, error: "Contract text is required." });
  }

  try {
    const userText = `Project Type: ${projectType || "Home renovation"}
Estimated Budget: $${projectBudget || "not specified"}
Contractor: ${contractorName || "not specified"} (${contractorTrade || "General"})

Contract / Quote Text:
---
${contractText}
---`;

    const review = await extractStructured({
      system: SYSTEM_PROMPT,
      userContent: [{ type: "text", text: userText }],
      schema: SCHEMA,
      toolName: "submit_contract_review",
      toolDescription: "Submit the structured contract/quote risk review for the homeowner.",
    });

    res.json({ success: true, review });
  } catch (err) {
    console.error("Contract review error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
