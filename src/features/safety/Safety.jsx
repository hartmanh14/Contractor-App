import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { card, btnPrimary, input } from "@/styles/theme";

export default function Safety() {
  const { safety, setSafety, safetyPct } = useApp();
  const [newItem, setNewItem] = useState("");

  function addItem() {
    if (!newItem.trim()) return;
    setSafety(prev => [...prev, { id: Date.now(), text: newItem.trim(), done: false }]);
    setNewItem("");
  }

  return (
    <div>
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Site Safety Score</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: safetyPct < 80 ? "#ef4444" : "#22c55e" }}>{safetyPct}%</div>
        </div>
        <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${safetyPct}%`,
            background: safetyPct < 80 ? "#ef4444" : "#22c55e", borderRadius: 99 }} />
        </div>
        {safetyPct < 100 && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#f59e0b" }}>
            ⚠ {safety.filter(s => !s.done).length} items need attention
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {safety.map(s => (
          <div key={s.id} style={{ ...card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button onClick={() => setSafety(prev => prev.map(x => x.id === s.id ? { ...x, done: !x.done } : x))}
                style={{ width: 24, height: 24, borderRadius: 99, border: "2px solid",
                  borderColor: s.done ? "#22c55e" : "#475569",
                  background: s.done ? "#22c55e" : "transparent",
                  color: "#fff", cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.done ? "✓" : ""}
              </button>
              <span style={{ fontSize: 14, color: s.done ? "#475569" : "#e2e8f0",
                textDecoration: s.done ? "line-through" : "none" }}>{s.text}</span>
            </div>
            <button onClick={() => setSafety(prev => prev.filter(x => x.id !== s.id))}
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input value={newItem} onChange={e => setNewItem(e.target.value)}
          placeholder="Add safety checklist item…"
          style={{ ...input, flex: 1 }}
          onKeyDown={e => e.key === "Enter" && addItem()} />
        <button onClick={addItem} style={btnPrimary}>Add</button>
      </div>
    </div>
  );
}
