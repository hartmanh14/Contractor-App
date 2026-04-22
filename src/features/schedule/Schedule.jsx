import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { PHASES, PHASE_SIGNOFF_CHECKLISTS } from "@/lib/constants";
import { StatusBadge, Modal } from "@/components/ui";
import { card, btnPrimary, btnSm, input, lbl } from "@/styles/theme";

function PhaseChecklistModal({ phase, onClose }) {
  const items = PHASE_SIGNOFF_CHECKLISTS[phase] || [];
  const [checked, setChecked] = useState(() => items.map(() => false));

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc" }}>{phase} Sign-Off</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Verify these before approving payment or moving to the next phase</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {items.length > 0 ? (
          <div>
            {items.map((item, i) => (
              <div key={i} onClick={() => setChecked(c => c.map((v, j) => j === i ? !v : v))}
                style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #1e293b", cursor: "pointer", alignItems: "flex-start" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, border: "2px solid", flexShrink: 0, marginTop: 1,
                  borderColor: checked[i] ? "#22c55e" : "#334155",
                  background: checked[i] ? "#22c55e" : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                }}>
                  {checked[i] ? "✓" : ""}
                </div>
                <div style={{ fontSize: 13, color: checked[i] ? "#475569" : "#e2e8f0", lineHeight: 1.6, textDecoration: checked[i] ? "line-through" : "none" }}>
                  {item}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, fontSize: 13, color: "#64748b" }}>
              {checked.filter(Boolean).length}/{items.length} items verified
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#64748b" }}>
            No specific checklist for this phase — use the general phase requirements from your approved plans.
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnPrimary}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function Schedule() {
  const { proj, projTasks, subs, tasks, setTasks, activeProject } = useApp();
  const [newTask, setNewTask] = useState(null);
  const [checklistPhase, setChecklistPhase] = useState(null);

  const grouped = PHASES.reduce((acc, ph) => {
    const ts = projTasks.filter(t => t.phase === ph);
    if (ts.length) acc[ph] = ts;
    return acc;
  }, {});

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "done" ? "upcoming" : "done" } : t));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setNewTask({ id: Date.now(), projectId: activeProject, title: "", subId: null, date: "", status: "upcoming", phase: proj?.phase ?? PHASES[0] })}
          style={btnPrimary}>+ Add Task</button>
      </div>

      {Object.entries(grouped).map(([ph, ts]) => {
        const allDone = ts.every(t => t.status === "done");
        const hasChecklist = !!PHASE_SIGNOFF_CHECKLISTS[ph];
        return (
          <div key={ph} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>{ph}</div>
              {hasChecklist && allDone && (
                <button onClick={() => setChecklistPhase(ph)} style={{ ...btnSm, color: "#f59e0b", fontSize: 11 }}>
                  ✓ Phase Checklist
                </button>
              )}
              {hasChecklist && !allDone && (
                <button onClick={() => setChecklistPhase(ph)} style={{ ...btnSm, fontSize: 11 }}>
                  Checklist
                </button>
              )}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {ts.map(t => (
                <div key={t.id} style={{ ...card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button onClick={() => toggleTask(t.id)}
                      style={{ width: 22, height: 22, borderRadius: 99, border: "2px solid",
                        borderColor: t.status === "done" ? "#22c55e" : "#334155",
                        background: t.status === "done" ? "#22c55e" : "transparent",
                        color: "#fff", cursor: "pointer", fontSize: 12,
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {t.status === "done" ? "✓" : ""}
                    </button>
                    <div>
                      <div style={{ fontSize: 14, color: t.status === "done" ? "#475569" : "#e2e8f0",
                        textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>
                        {t.date}{t.subId ? ` · ${subs.find(s => s.id === t.subId)?.name}` : ""}
                      </div>
                    </div>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {newTask && (
        <Modal title="New Task" onClose={() => setNewTask(null)}
          onSave={() => { setTasks(prev => [...prev, newTask]); setNewTask(null); }}>
          <div>
            <label style={lbl}>Title</label>
            <input style={input} value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
            <label style={lbl}>Date</label>
            <input type="date" style={input} value={newTask.date} onChange={e => setNewTask(t => ({ ...t, date: e.target.value }))} />
            <label style={lbl}>Phase</label>
            <select style={input} value={newTask.phase} onChange={e => setNewTask(t => ({ ...t, phase: e.target.value }))}>
              {PHASES.map(p => <option key={p}>{p}</option>)}
            </select>
            <label style={lbl}>Subcontractor</label>
            <select style={input} value={newTask.subId || ""} onChange={e => setNewTask(t => ({ ...t, subId: e.target.value ? +e.target.value : null }))}>
              <option value="">None</option>
              {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {checklistPhase && (
        <PhaseChecklistModal phase={checklistPhase} onClose={() => setChecklistPhase(null)} />
      )}
    </div>
  );
}
