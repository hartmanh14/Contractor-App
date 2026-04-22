import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { TRADES, TRADE_VETTING_TIPS, HIRING_RED_FLAGS, HIRING_CONTRACT_MUSTS, REFERENCE_QUESTIONS } from "@/lib/constants";
import { StatusBadge, Stars, Pill, Modal } from "@/components/ui";
import { card, btnPrimary, btnSm } from "@/styles/theme";
import SubForm from "./SubForm";

const VETTING_TABS = ["Pre-Hire Checklist", "Contract Must-Haves", "Reference Questions", "Red Flags"];

function VettingGuide({ sub, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const tradeTips = TRADE_VETTING_TIPS[sub?.trade] || [];

  const tabContent = [
    {
      items: [
        "Verify the license number at your state's contractor licensing board website",
        "Request a Certificate of Insurance (COI) directly from their carrier — not a copy",
        "Confirm general liability coverage is at least $1,000,000",
        "Confirm they carry workers' compensation for all employees on your job",
        "Get at least 2–3 competing quotes before deciding",
        "Check Google, BBB, and Houzz reviews using the company's legal business name",
        "Call 2–3 references from jobs completed in the last 2 years",
        "Confirm they pull all required permits in their name",
        "Review the contract thoroughly — use the Contract Review tool",
        ...tradeTips.map(t => t),
      ],
      color: "#3b82f6",
    },
    { items: HIRING_CONTRACT_MUSTS, color: "#22c55e" },
    { items: REFERENCE_QUESTIONS, color: "#a855f7" },
    { items: HIRING_RED_FLAGS, color: "#ef4444" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc" }}>Hiring Guide</div>
            {sub && <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{sub.name} · {sub.trade}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {VETTING_TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)} style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none",
              background: activeTab === i ? tabContent[i].color + "22" : "#1e293b",
              color: activeTab === i ? tabContent[i].color : "#64748b",
            }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tabContent[activeTab].items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "10px 0",
              borderBottom: i < tabContent[activeTab].items.length - 1 ? "1px solid #1e293b" : "none",
            }}>
              <span style={{ color: tabContent[activeTab].color, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>
                {activeTab === 3 ? "✗" : activeTab === 2 ? `${i + 1}.` : "✓"}
              </span>
              <span style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: "12px 14px", background: "#3b82f611", border: "1px solid #3b82f633", borderRadius: 8, fontSize: 13, color: "#93c5fd" }}>
          Use the <strong>Contracts</strong> tab to run an AI review of any quote or contract before signing.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{ ...btnPrimary }}>Got it</button>
        </div>
      </div>
    </div>
  );
}

export default function Subs() {
  const { subs, setSubs, setTab } = useApp();
  const [form, setForm] = useState(null);
  const [vettingTarget, setVettingTarget] = useState(null);

  function saveForm() {
    setSubs(prev =>
      prev.find(s => s.id === form.id)
        ? prev.map(s => s.id === form.id ? form : s)
        : [...prev, form]
    );
    setForm(null);
  }

  const newSubTemplate = {
    id: Date.now(), name: "", trade: TRADES[0], phone: "", email: "",
    licensed: false, insured: false, rating: 3, status: "potential", notes: "",
    licenseNum: "", insuranceExpiry: "", yearsExp: "", referencesChecked: false,
  };

  function vetScore(s) {
    let score = 0;
    if (s.licensed) score++;
    if (s.insured) score++;
    if (s.licenseNum) score++;
    if (s.referencesChecked) score++;
    if (s.insuranceExpiry) score++;
    return score;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>{subs.length} subcontractors</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTab("Find Subs")} style={{ ...btnSm, color: "#3b82f6" }}>🔍 Find Subs</button>
          <button onClick={() => setForm(newSubTemplate)} style={btnPrimary}>+ Add Manually</button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {subs.map(s => {
          const score = vetScore(s);
          const vetColor = score >= 4 ? "#22c55e" : score >= 2 ? "#f59e0b" : "#ef4444";
          return (
            <div key={s.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0" }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{s.trade}</div>
                  {s.yearsExp && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{s.yearsExp} yrs experience</div>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusBadge s={s.status} />
                  <Stars n={s.rating} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, margin: "10px 0", flexWrap: "wrap" }}>
                {s.phone && <a href={`tel:${s.phone}`} style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>📞 {s.phone}</a>}
                {s.email && <a href={`mailto:${s.email}`} style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>✉ {s.email}</a>}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Pill label="Licensed" ok={s.licensed} />
                <Pill label="Insured" ok={s.insured} />
                {s.referencesChecked && <Pill label="Refs Checked" ok={true} />}
              </div>

              {s.licenseNum && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#475569" }}>
                  License: <span style={{ color: "#94a3b8" }}>{s.licenseNum}</span>
                </div>
              )}

              {s.insuranceExpiry && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>
                  Insurance expires: <span style={{ color: new Date(s.insuranceExpiry) < new Date() ? "#ef4444" : "#94a3b8" }}>{s.insuranceExpiry}</span>
                </div>
              )}

              {/* Vetting score bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Vetting</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: vetColor }}>{score}/5 items</div>
                </div>
                <div style={{ height: 4, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(score / 5) * 100}%`, background: vetColor, borderRadius: 99, transition: "width .4s" }} />
                </div>
              </div>

              {s.notes && <div style={{ marginTop: 10, fontSize: 13, color: "#64748b", fontStyle: "italic" }}>"{s.notes}"</div>}

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => setVettingTarget(s)} style={{ ...btnSm, color: "#3b82f6" }}>Hire Guide</button>
                <button onClick={() => setForm(s)} style={btnSm}>Edit</button>
                <button onClick={() => setSubs(prev => prev.filter(x => x.id !== s.id))} style={{ ...btnSm, color: "#ef4444" }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {form && (
        <Modal title={form.name ? "Edit Sub" : "New Subcontractor"} onClose={() => setForm(null)} onSave={saveForm}>
          <SubForm form={form} setForm={setForm} />
        </Modal>
      )}

      {vettingTarget !== null && (
        <VettingGuide sub={vettingTarget} onClose={() => setVettingTarget(null)} />
      )}
    </div>
  );
}
