import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { fmt } from "@/lib/utils";
import { card, btnSm, btnPrimary } from "@/styles/theme";

const DIFF_COLORS = { beginner: "#22c55e", intermediate: "#f59e0b", advanced: "#ef4444" };
const DIFF_BG = { beginner: "#22c55e11", intermediate: "#f59e0b11", advanced: "#ef444411" };
const ACTION_COLORS = { have: "#22c55e", buy: "#f59e0b", rent: "#a855f7" };
const ACTION_LABELS = { have: "You have this", buy: "Need to buy", rent: "Can rent" };
const STATUS_OPTS = ["planning", "in-progress", "complete"];

export default function DIYDetail({ project, onBack }) {
  const { diyProjects, setDIYProjects } = useApp();
  const [activeTab, setActiveTab] = useState("steps");
  const [expandedStep, setExpandedStep] = useState(null);

  const a = project.aiAnalysis;

  function update(changes) {
    setDIYProjects(prev => prev.map(p => p.id === project.id ? { ...p, ...changes } : p));
  }

  function toggleStep(num) {
    const current = project.completedSteps;
    update({ completedSteps: current.includes(num) ? current.filter(n => n !== num) : [...current, num] });
  }

  function toggleMaterial(idx) {
    const current = project.boughtMaterials;
    update({ boughtMaterials: current.includes(idx) ? current.filter(i => i !== idx) : [...current, idx] });
  }

  const totalSteps = a?.steps?.length || 0;
  const doneSteps = project.completedSteps?.length || 0;
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
  const diffColor = DIFF_COLORS[a?.difficulty] || "#64748b";

  const tabs = [
    { key: "steps", label: `Steps (${doneSteps}/${totalSteps})` },
    { key: "materials", label: `Materials & Tools` },
    { key: "tips", label: "Tips & Safety" },
  ];

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ ...btnSm, marginBottom: 16 }}>← All DIY Projects</button>

      {/* Project header */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc" }}>{project.name}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{project.room}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {a?.difficulty && (
              <div style={{ padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: "capitalize", background: DIFF_BG[a.difficulty], color: diffColor }}>
                {a.difficulty}
              </div>
            )}
            <select value={project.status} onChange={e => update({ status: e.target.value })}
              style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
              {STATUS_OPTS.map(s => <option key={s} value={s} style={{ textTransform: "capitalize" }}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Stats row */}
        {a && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { icon: "⏱", label: `${a.totalTimeHours} hrs`, sub: a.timeBreakdown },
              { icon: "💰", label: fmt(a.estimatedTotalCost), sub: "estimated cost" },
              { icon: "📦", label: `${a.materials.length} materials`, sub: `${project.boughtMaterials.length} acquired` },
              { icon: "🔨", label: `${a.tools.filter(t => t.action === "buy").length} tools to buy`, sub: `${a.tools.filter(t => t.action === "have").length} you already have` },
            ].map(st => (
              <div key={st.label}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{st.icon} {st.label}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{st.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {totalSteps > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 5 }}>
              <span>Progress</span>
              <span style={{ color: pct === 100 ? "#22c55e" : "#94a3b8", fontWeight: 700 }}>{pct}% — {doneSteps}/{totalSteps} steps done</span>
            </div>
            <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22c55e" : "#3b82f6", borderRadius: 99, transition: "width .4s" }} />
            </div>
          </div>
        )}

        {pct === 100 && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: 8, fontSize: 13, color: "#86efac", fontWeight: 700 }}>
            🎉 All steps complete! Don't forget to mark the project as Complete above.
          </div>
        )}
      </div>

      {/* AI visualization */}
      {a?.imageUrl && (
        <div style={{ ...card, marginBottom: 20, overflow: "hidden", padding: 0 }}>
          <img src={a.imageUrl} alt="AI visualization" style={{ width: "100%", display: "block", borderRadius: 14 }} />
          <div style={{ padding: "10px 16px", fontSize: 12, color: "#475569", fontStyle: "italic" }}>AI-generated visualization of the finished result</div>
        </div>
      )}
      {a && !a.imageUrl && (
        <div style={{ ...card, marginBottom: 20, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Finished Result</div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic" }}>{a.imagePrompt}</div>
          <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>Add an OpenAI API key to generate a visualization</div>
        </div>
      )}

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "1px solid #1e293b", paddingBottom: 2 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
            background: activeTab === t.key ? "#0f172a" : "transparent",
            color: activeTab === t.key ? "#e2e8f0" : "#64748b",
            borderBottom: activeTab === t.key ? "2px solid #3b82f6" : "2px solid transparent",
          }}>{t.label}</button>
        ))}
      </div>

      {/* STEPS TAB */}
      {activeTab === "steps" && a?.steps && (
        <div>
          {a.steps.map(step => {
            const done = project.completedSteps?.includes(step.number);
            const isExpanded = expandedStep === step.number;
            const isCurrent = !done && project.completedSteps?.length === step.number - 1;

            return (
              <div key={step.number} style={{
                ...card, marginBottom: 10, padding: 0, overflow: "hidden",
                borderColor: isCurrent ? "#3b82f633" : done ? "#22c55e22" : "#1e293b",
                background: isCurrent ? "#3b82f605" : done ? "#22c55e04" : "#0f172a",
              }}>
                {/* Step header — always visible */}
                <div
                  onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggleStep(step.number); }}
                    style={{
                      width: 26, height: 26, borderRadius: "50%", border: "2px solid", flexShrink: 0,
                      borderColor: done ? "#22c55e" : "#334155",
                      background: done ? "#22c55e" : "transparent",
                      color: "#fff", cursor: "pointer", fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >{done ? "✓" : ""}</button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#475569" : "#e2e8f0", textDecoration: done ? "line-through" : "none" }}>
                        {step.number}. {step.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#475569", flexShrink: 0, marginLeft: 8 }}>{step.timeMinutes} min</div>
                    </div>
                    {isCurrent && !isExpanded && <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 2 }}>← current step</div>}
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: "0 16px 16px 54px" }}>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 10 }}>{step.description}</div>
                    {step.tips && (
                      <div style={{ background: "#3b82f611", border: "1px solid #3b82f622", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#93c5fd", marginBottom: 8 }}>
                        💡 <strong>Pro tip:</strong> {step.tips}
                      </div>
                    )}
                    {step.warning && (
                      <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b33", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fcd34d" }}>
                        ⚠ {step.warning}
                      </div>
                    )}
                    <button onClick={() => toggleStep(step.number)} style={{ ...btnSm, marginTop: 10, color: done ? "#94a3b8" : "#22c55e" }}>
                      {done ? "Mark incomplete" : "✓ Mark done"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MATERIALS & TOOLS TAB */}
      {activeTab === "materials" && a && (
        <div>
          {/* Materials checklist */}
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Materials — {project.boughtMaterials?.length || 0}/{a.materials.length} acquired
          </div>
          <div style={{ ...card, marginBottom: 20, padding: "6px 0" }}>
            {a.materials.map((m, i) => {
              const acquired = project.boughtMaterials?.includes(i);
              return (
                <div key={i} onClick={() => toggleMaterial(i)} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: "1px solid #1e293b", cursor: "pointer", alignItems: "flex-start" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid", flexShrink: 0, marginTop: 1, borderColor: acquired ? "#22c55e" : "#334155", background: acquired ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>
                    {acquired ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 13, color: acquired ? "#475569" : "#e2e8f0", fontWeight: 600, textDecoration: acquired ? "line-through" : "none" }}>{m.item}</div>
                      <div style={{ fontSize: 13, color: acquired ? "#475569" : "#22c55e", fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{fmt(m.cost)}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{m.qty} {m.unit} · {m.store}</div>
                    {m.notes && <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 2 }}>💡 {m.notes}</div>}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: "#64748b" }}>Total materials</span>
              <span style={{ color: "#22c55e" }}>{fmt(a.materials.reduce((s, m) => s + m.cost, 0))}</span>
            </div>
          </div>

          {/* Tools */}
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Tools Needed
          </div>
          <div style={{ ...card, padding: "6px 0" }}>
            {a.tools.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: "1px solid #1e293b", alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACTION_COLORS[t.action], flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{t.item}</div>
                    {t.cost > 0 && <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>{fmt(t.cost)}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: ACTION_COLORS[t.action], marginTop: 1 }}>{ACTION_LABELS[t.action]}</div>
                  {t.notes && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{t.notes}</div>}
                </div>
              </div>
            ))}
            {a.tools.filter(t => t.cost > 0).length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: "#64748b" }}>Tools to purchase/rent</span>
                <span style={{ color: "#f59e0b" }}>{fmt(a.tools.reduce((s, t) => s + (t.cost || 0), 0))}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIPS & SAFETY TAB */}
      {activeTab === "tips" && a && (
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Pro Tips
          </div>
          <div style={{ ...card, marginBottom: 20 }}>
            {a.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < a.tips.length - 1 ? "1px solid #1e293b" : "none" }}>
                <span style={{ color: "#3b82f6", flexShrink: 0, fontWeight: 700 }}>💡</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Safety Notes
          </div>
          <div style={{ ...card }}>
            {a.safetyNotes.map((note, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < a.safetyNotes.length - 1 ? "1px solid #1e293b" : "none" }}>
                <span style={{ color: "#f59e0b", flexShrink: 0 }}>⚠</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>{note}</span>
              </div>
            ))}
          </div>

          {a.difficultyReason && (
            <div style={{ ...card, marginTop: 16, borderColor: `${diffColor}33`, background: `${diffColor}08` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: diffColor, textTransform: "capitalize", marginBottom: 4 }}>
                {a.difficulty} Level
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{a.difficultyReason}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
