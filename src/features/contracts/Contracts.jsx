import { useState } from "react";
import { TRADES } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { card, btnPrimary, btnSm, input, lbl } from "@/styles/theme";

const RISK_COLORS = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };
const RISK_BG = { low: "#22c55e11", medium: "#f59e0b11", high: "#ef444411" };
const RISK_BORDER = { low: "#22c55e33", medium: "#f59e0b33", high: "#ef444433" };
const SEVERITY_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#94a3b8" };

const MOCK_REVIEW = {
  riskScore: "medium",
  riskSummary: "This quote has several gaps that leave you financially exposed. The payment terms heavily favor the contractor, and key legal protections are missing. Do not sign as written — use the points below to negotiate first.",
  redFlags: [
    {
      severity: "high",
      issue: "Large upfront deposit (50%)",
      why: "Paying half the contract value before significant work is done gives the contractor your money with little recourse if they abandon the job or do poor work.",
      action: "Counter with: 10% to mobilize, 30% at rough-in inspection sign-off, 30% at substantial completion, 30% at final walkthrough and punch-list sign-off.",
    },
    {
      severity: "high",
      issue: "No completion date specified",
      why: "Without a written end date, there is no legal leverage if the project drags on for months beyond what was discussed verbally.",
      action: "Add a clause with a target completion date and a $150/day penalty for delays beyond 2 weeks from that date (excluding documented weather or permit delays).",
    },
    {
      severity: "medium",
      issue: "No lien waiver requirement",
      why: "If the contractor doesn't pay their material suppliers or subcontractors, those parties can file a mechanic's lien against your property — even after you paid the contractor in full.",
      action: "Add: 'Contractor shall provide conditional lien waivers from all subcontractors and suppliers concurrent with each progress payment.'",
    },
    {
      severity: "medium",
      issue: "Change order process not defined",
      why: "Without a written change order process, verbal approvals for 'small additions' can accumulate into thousands of dollars of disputed charges after the fact.",
      action: "Add: 'All changes to scope must be documented in a signed change order with price and timeline impact agreed before any additional work begins.'",
    },
    {
      severity: "low",
      issue: "Warranty terms are vague",
      why: "'Standard warranty' has no legal meaning. You need specific duration and coverage terms in writing.",
      action: "Request: 'Contractor warrants all workmanship for a period of one (1) year from date of substantial completion. Defects discovered within this period will be corrected at no cost to the owner.'",
    },
  ],
  missingClauses: [
    {
      clause: "Lien Waiver Requirement",
      why: "Protects your property from mechanic's liens filed by unpaid subcontractors or material suppliers.",
      suggestedLanguage: "Contractor shall provide conditional lien waivers from all subcontractors and material suppliers concurrent with each progress payment, and final unconditional lien waivers from all parties upon receipt of final payment.",
    },
    {
      clause: "Permit Responsibility",
      why: "Confirms the contractor — not you — is responsible for permits. Homeowner-pulled permits can void insurance claims and cause problems at resale.",
      suggestedLanguage: "Contractor shall obtain all required building, electrical, plumbing, and mechanical permits prior to beginning work. All permit fees are included in the contract price. Contractor is responsible for scheduling and passing all required inspections.",
    },
    {
      clause: "Dispute Resolution",
      why: "Without this, any dispute immediately becomes litigation — expensive, slow, and adversarial.",
      suggestedLanguage: "Any dispute arising from this agreement shall first be subject to good-faith mediation with a mutually agreed mediator. Costs of mediation shall be shared equally. Only if mediation fails may either party pursue legal action.",
    },
    {
      clause: "Cleanup & Debris Removal",
      why: "Prevents disputes about daily cleanup and final waste disposal responsibility.",
      suggestedLanguage: "Contractor shall maintain a clean and orderly worksite, removing construction debris at the end of each work day. Upon project completion, Contractor shall remove all equipment, materials, and waste from the property within three (3) business days.",
    },
  ],
  paymentAnalysis: {
    structure: "50% deposit before work starts, 50% upon completion.",
    recommended: "10% mobilization deposit · 30% at rough-in inspection sign-off · 30% at substantial completion · 30% at final punch-list sign-off (withhold 10% retainage for 30 days after final walkthrough to ensure all items are addressed).",
    concerns: [
      "50% upfront is far above the industry standard of 10–15% for most trades",
      "No milestone-based payments means you lose negotiating leverage if quality issues arise mid-project",
      "No retainage provision reduces pressure on the contractor to complete punch-list items",
    ],
  },
  priceAssessment: {
    verdict: "unclear",
    notes: "Without a line-item breakdown by category and trade, it is impossible to determine whether this price is fair. A legitimate contractor should be able to provide an itemized quote. Request one before signing.",
  },
  negotiationPoints: [
    "Reduce upfront deposit to 10% maximum",
    "Add milestone-based payment schedule tied to inspection sign-offs",
    "Add a written project completion date with a reasonable late-completion penalty",
    "Request a full itemized cost breakdown by category and trade",
    "Require lien waivers from the contractor and all subcontractors with each payment",
    "Define warranty: minimum 1 year workmanship with specific coverage",
    "Add written change order requirement — no verbal authorizations",
    "Confirm contractor pulls all permits and pays all permit fees",
  ],
  requiredBeforeSigning: [
    "Verify the contractor's license number at your state's licensing board website",
    "Request a Certificate of Insurance (COI) directly from their insurance carrier — not a copy",
    "Confirm general liability coverage is at least $1,000,000 per occurrence",
    "Confirm they carry workers' compensation insurance for all employees",
    "Get at least 2–3 competing quotes for comparison",
    "Check Google, BBB, and Houzz reviews using the company's legal name",
    "Call 2–3 references from similar projects completed in the last 2 years",
  ],
  overallAdvice: "Do not sign this contract as written — the payment structure and missing protective clauses create real financial risk. Use the negotiation points above to request specific revisions before signing. A quality, reputable contractor will agree to all of these standard protections without hesitation. If they refuse to add basic terms like lien waivers or a written completion date, treat that as a serious red flag and consider other contractors.",
};

async function runReview(formData) {
  try {
    const res = await fetch("/api/review-contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Server error");
    return { review: data.review, demo: false };
  } catch {
    await new Promise(r => setTimeout(r, 1800));
    return { review: MOCK_REVIEW, demo: true };
  }
}

const s = {
  sectionHead: {
    fontSize: 12, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, marginTop: 24,
  },
  flagCard: {
    background: "#0a0f1e", border: "1px solid #1e293b",
    borderRadius: 10, padding: "12px 14px", marginBottom: 8,
  },
  bullet: { fontSize: 14, color: "#e2e8f0", padding: "6px 0", borderBottom: "1px solid #1e293b", display: "flex", gap: 10 },
};

export default function Contracts() {
  const [form, setForm] = useState({ contractText: "", projectType: "", projectBudget: "", contractorName: "", contractorTrade: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleReview() {
    if (!form.contractText.trim()) return;
    setLoading(true);
    setResult(null);
    const { review, demo } = await runReview(form);
    setResult(review);
    setIsDemo(demo);
    setLoading(false);
  }

  const riskColor = result ? RISK_COLORS[result.riskScore] : "#64748b";

  return (
    <div>
      {/* Intro */}
      <div style={{ ...card, marginBottom: 20, borderColor: "#3b82f633", background: "#3b82f608" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#93c5fd", marginBottom: 6 }}>AI Quote & Contract Review</div>
        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
          Paste a contractor quote or contract below and AI will identify red flags, missing protections, payment term problems,
          and exactly what to negotiate before you sign — in plain English.
        </div>
      </div>

      {/* Form */}
      <div style={card}>
        <label style={lbl}>Paste Quote or Contract Text *</label>
        <textarea
          value={form.contractText}
          onChange={e => setF("contractText", e.target.value)}
          placeholder="Paste the full text of the quote, proposal, or contract here…"
          rows={10}
          style={{ ...input, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
          <div>
            <label style={lbl}>Contractor Name</label>
            <input style={input} value={form.contractorName} onChange={e => setF("contractorName", e.target.value)} placeholder="ABC Contracting LLC" />
          </div>
          <div>
            <label style={lbl}>Trade / Work Type</label>
            <select style={input} value={form.contractorTrade} onChange={e => setF("contractorTrade", e.target.value)}>
              <option value="">— Select trade —</option>
              {TRADES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Project Type</label>
            <input style={input} value={form.projectType} onChange={e => setF("projectType", e.target.value)} placeholder="Kitchen remodel, roof replacement…" />
          </div>
          <div>
            <label style={lbl}>Your Budget</label>
            <input style={input} type="number" value={form.projectBudget} onChange={e => setF("projectBudget", e.target.value)} placeholder="35000" />
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleReview}
            disabled={!form.contractText.trim() || loading}
            style={{ ...btnPrimary, opacity: (!form.contractText.trim() || loading) ? 0.4 : 1 }}
          >
            {loading ? "Analyzing…" : "Review Contract →"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ ...card, textAlign: "center", padding: "48px 20px", marginTop: 16 }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 40, height: 40, borderRadius: "50%", margin: "0 auto 16px", border: "3px solid #1e293b", borderTop: "3px solid #3b82f6", animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>Reviewing your contract…</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Checking for red flags · Analyzing payment terms · Identifying missing clauses</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ marginTop: 20 }}>
          {isDemo && (
            <div style={{ ...card, borderColor: "#f59e0b44", background: "#f59e0b08", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#fcd34d", fontWeight: 700 }}>Demo Mode — Sample Review</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                The AI server isn't running or has no API key — this is a sample review to show you what the tool does.
                Add your <code style={{ background: "#1e293b", padding: "1px 4px", borderRadius: 3 }}>ANTHROPIC_API_KEY</code> to get real analysis of your actual contracts.
              </div>
            </div>
          )}

          {/* Risk Score Banner */}
          <div style={{ ...card, borderColor: RISK_BORDER[result.riskScore], background: RISK_BG[result.riskScore], marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 36 }}>{result.riskScore === "high" ? "🔴" : result.riskScore === "medium" ? "🟡" : "🟢"}</div>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Overall Risk</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: riskColor, textTransform: "capitalize" }}>{result.riskScore}</div>
              </div>
              <div style={{ flex: 1, fontSize: 14, color: "#e2e8f0", lineHeight: 1.6, paddingLeft: 8, borderLeft: "1px solid #1e293b" }}>
                {result.riskSummary}
              </div>
            </div>
          </div>

          {/* Red Flags */}
          {result.redFlags?.length > 0 && (
            <div>
              <div style={s.sectionHead}>🚩 Red Flags ({result.redFlags.length})</div>
              {[...result.redFlags].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - ({ high: 0, medium: 1, low: 2 }[b.severity]))).map((flag, i) => (
                <div key={i} style={{ ...s.flagCard, borderLeft: `3px solid ${SEVERITY_COLORS[flag.severity]}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: SEVERITY_COLORS[flag.severity], textTransform: "uppercase", letterSpacing: ".06em" }}>
                      {flag.severity}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>{flag.issue}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>{flag.why}</div>
                  <div style={{ fontSize: 13, color: "#93c5fd", background: "#3b82f611", padding: "8px 10px", borderRadius: 6 }}>
                    <strong>What to do:</strong> {flag.action}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Missing Clauses */}
          {result.missingClauses?.length > 0 && (
            <div>
              <div style={s.sectionHead}>📄 Missing Contract Clauses</div>
              {result.missingClauses.map((c, i) => (
                <div key={i} style={s.flagCard}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{c.clause}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>{c.why}</div>
                  <div style={{ fontSize: 12, color: "#64748b", background: "#1e293b", padding: "10px 12px", borderRadius: 6, fontStyle: "italic", lineHeight: 1.6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>Suggested language to request:</div>
                    "{c.suggestedLanguage}"
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
            {/* Payment Analysis */}
            {result.paymentAnalysis && (
              <div style={card}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 10 }}>💳 Payment Analysis</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>As Written</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>{result.paymentAnalysis.structure}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Recommended</div>
                <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 10 }}>{result.paymentAnalysis.recommended}</div>
                {result.paymentAnalysis.concerns?.map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#94a3b8", padding: "4px 0", borderTop: "1px solid #1e293b" }}>⚠ {c}</div>
                ))}
              </div>
            )}

            {/* Price Assessment */}
            {result.priceAssessment && (
              <div style={card}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 10 }}>💰 Price Assessment</div>
                <div style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 99, marginBottom: 10,
                  fontSize: 13, fontWeight: 700, textTransform: "capitalize",
                  background: { reasonable: "#22c55e22", high: "#ef444422", low: "#f59e0b22", unclear: "#94a3b822" }[result.priceAssessment.verdict],
                  color: { reasonable: "#22c55e", high: "#ef4444", low: "#f59e0b", unclear: "#94a3b8" }[result.priceAssessment.verdict],
                }}>
                  {result.priceAssessment.verdict}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{result.priceAssessment.notes}</div>
              </div>
            )}
          </div>

          {/* Negotiation Points */}
          {result.negotiationPoints?.length > 0 && (
            <div style={{ ...card, marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>🤝 What to Negotiate Before Signing</div>
              {result.negotiationPoints.map((pt, i) => (
                <div key={i} style={{ ...s.bullet }}>
                  <span style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }}>→</span>
                  <span style={{ fontSize: 13, color: "#e2e8f0" }}>{pt}</span>
                </div>
              ))}
            </div>
          )}

          {/* Required Before Signing */}
          {result.requiredBeforeSigning?.length > 0 && (
            <div style={{ ...card, marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>✅ Do These Before Signing</div>
              {result.requiredBeforeSigning.map((item, i) => (
                <div key={i} style={{ ...s.bullet }}>
                  <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#e2e8f0" }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Overall Advice */}
          {result.overallAdvice && (
            <div style={{ ...card, marginTop: 16, borderColor: "#3b82f633", background: "#3b82f608" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#93c5fd", marginBottom: 8 }}>Overall Recommendation</div>
              <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.7 }}>{result.overallAdvice}</div>
            </div>
          )}

          {/* Reset */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button onClick={() => { setResult(null); setForm({ contractText: "", projectType: "", projectBudget: "", contractorName: "", contractorTrade: "" }); }} style={btnSm}>
              Review Another Contract
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
