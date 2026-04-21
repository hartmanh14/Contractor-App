import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { PHASES } from "@/lib/constants";
import { StatusBadge, Modal } from "@/components/ui";
import { card, btnPrimary, input, lbl } from "@/styles/theme";

export default function Schedule() {
  const { proj, projTasks, subs, tasks, setTasks, activeProject } = useApp();
  const [newTask, setNewTask] = useState(null);

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

      {Object.entries(grouped).map(([ph, ts]) => (
        <div key={ph} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{ph}</div>
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
      ))}

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
    </div>
  );
}
