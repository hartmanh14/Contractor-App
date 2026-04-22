import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { fmt } from "@/lib/utils";
import { card, btnPrimary, btnSm, input, lbl } from "@/styles/theme";
import { Modal } from "@/components/ui";

function AddLineItemModal({ onClose, onSave, projectId }) {
  const [cat, setCat] = useState("");
  const [budgeted, setBudgeted] = useState("");

  function save() {
    if (!cat.trim() || !budgeted) return;
    onSave({ id: Date.now(), projectId, category: cat.trim(), budgeted: parseFloat(budgeted), actual: 0, paid: false, lienWaiver: false });
    onClose();
  }

  return (
    <Modal title="Add Budget Line Item" onClose={onClose} onSave={save} saveLabel="Add">
      <div>
        <label style={lbl}>Category</label>
        <input style={input} value={cat} onChange={e => setCat(e.target.value)} placeholder="e.g. HVAC Replacement" autoFocus />
        <label style={lbl}>Budgeted Amount</label>
        <input style={input} type="number" value={budgeted} onChange={e => setBudgeted(e.target.value)} placeholder="5000" />
      </div>
    </Modal>
  );
}

export default function Budget() {
  const { projBudget, setBudget, totalBudgeted, totalActual, activeProject } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const over = totalActual > totalBudgeted;

  const paidItems = projBudget.filter(b => b.paid);
  const lienWaiverCount = paidItems.filter(b => b.lienWaiver).length;
  const lienWaiverPct = paidItems.length > 0 ? Math.round((lienWaiverCount / paidItems.length) * 100) : 100;
  const lienOk = paidItems.length === 0 || lienWaiverCount === paidItems.length;

  function toggle(id, field) {
    setBudget(prev => prev.map(x => x.id === id ? { ...x, [field]: !x[field] } : x));
  }

  function addItem(item) {
    setBudget(prev => [...prev, item]);
  }

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>Total Budget</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#94a3b8", marginTop: 4 }}>{fmt(totalBudgeted)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>Spent So Far</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: over ? "#ef4444" : "#22c55e", marginTop: 4 }}>{fmt(totalActual)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>Remaining</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: over ? "#ef4444" : "#3b82f6", marginTop: 4 }}>{fmt(totalBudgeted - totalActual)}</div>
        </div>
        <div style={{ ...card, borderColor: lienOk ? "#22c55e33" : "#f59e0b33", background: lienOk ? "#22c55e08" : "#f59e0b08" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>Lien Waivers</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: lienOk ? "#22c55e" : "#f59e0b", marginTop: 4 }}>{lienWaiverPct}%</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{lienWaiverCount}/{paidItems.length} paid items</div>
        </div>
      </div>

      {/* Budget progress bar */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(100, (totalActual / totalBudgeted) * 100)}%`, background: over ? "#ef4444" : "#22c55e", borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginTop: 8 }}>
          <span>Spent: {fmt(totalActual)}</span>
          <span>{Math.round((totalActual / totalBudgeted) * 100)}% of budget used</span>
          <span>Budget: {fmt(totalBudgeted)}</span>
        </div>
      </div>

      {/* Lien waiver tip */}
      {paidItems.length > 0 && !lienOk && (
        <div style={{ ...card, borderColor: "#f59e0b44", background: "#f59e0b08", marginBottom: 16, fontSize: 13, color: "#fcd34d" }}>
          ⚠ <strong>Lien Waiver Reminder:</strong> Always collect a signed lien waiver before or when making each payment. Without one, a sub or supplier can legally put a lien on your property even after you've paid the contractor.
        </div>
      )}

      {/* Table header + add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>{projBudget.length} line items</div>
        <button onClick={() => setShowAdd(true)} style={{ ...btnSm, color: "#22c55e" }}>+ Add Line Item</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["Category", "Budgeted", "Actual", "Variance", "Paid", "Lien Waiver"].map(h => (
                <th key={h} style={{
                  textAlign: h === "Category" ? "left" : "right",
                  padding: "8px 12px", color: "#64748b",
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projBudget.map(b => {
              const variance = b.budgeted - b.actual;
              return (
                <tr key={b.id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "10px 12px", color: "#e2e8f0" }}>{b.category}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "#94a3b8" }}>{fmt(b.budgeted)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: b.actual ? "#e2e8f0" : "#475569" }}>
                    {b.actual ? fmt(b.actual) : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: b.actual === 0 ? "#475569" : variance >= 0 ? "#22c55e" : "#ef4444" }}>
                    {b.actual === 0 ? "—" : (variance >= 0 ? "+" : "") + fmt(variance)}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <button onClick={() => toggle(b.id, "paid")} style={{
                      background: b.paid ? "#22c55e22" : "#1e293b",
                      color: b.paid ? "#22c55e" : "#475569",
                      border: "none", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12,
                    }}>
                      {b.paid ? "✓ Paid" : "Unpaid"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    {b.paid ? (
                      <button onClick={() => toggle(b.id, "lienWaiver")} style={{
                        background: b.lienWaiver ? "#22c55e22" : "#f59e0b11",
                        color: b.lienWaiver ? "#22c55e" : "#f59e0b",
                        border: `1px solid ${b.lienWaiver ? "#22c55e33" : "#f59e0b33"}`,
                        borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12,
                      }}>
                        {b.lienWaiver ? "✓ Received" : "Pending"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#334155" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddLineItemModal
          onClose={() => setShowAdd(false)}
          onSave={addItem}
          projectId={activeProject}
        />
      )}
    </div>
  );
}
