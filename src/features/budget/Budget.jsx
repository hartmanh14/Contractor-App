import { useApp } from "@/store/AppContext";
import { fmt } from "@/lib/utils";
import { card } from "@/styles/theme";

export default function Budget() {
  const { projBudget, setBudget, totalBudgeted, totalActual } = useApp();
  const over = totalActual > totalBudgeted;

  return (
    <div>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, textAlign: "center" }}>
          {[
            { label: "Total Budget", val: fmt(totalBudgeted), color: "#94a3b8" },
            { label: "Total Actual", val: fmt(totalActual),   color: over ? "#ef4444" : "#22c55e" },
            { label: "Remaining",    val: fmt(totalBudgeted - totalActual), color: over ? "#ef4444" : "#3b82f6" },
          ].map(x => (
            <div key={x.label}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>{x.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: x.color, marginTop: 4 }}>{x.val}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden", marginTop: 20 }}>
          <div style={{ height: "100%", width: `${Math.min(100, (totalActual / totalBudgeted) * 100)}%`,
            background: over ? "#ef4444" : "#22c55e", borderRadius: 99 }} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["Category", "Budgeted", "Actual", "Variance", "Paid"].map(h => (
                <th key={h} style={{ textAlign: h === "Category" ? "left" : "right", padding: "8px 12px",
                  color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>{h}</th>
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
                  <td style={{ padding: "10px 12px", textAlign: "right", color: b.actual ? "#e2e8f0" : "#475569" }}>{b.actual ? fmt(b.actual) : "—"}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: b.actual === 0 ? "#475569" : variance >= 0 ? "#22c55e" : "#ef4444" }}>
                    {b.actual === 0 ? "—" : (variance >= 0 ? "+" : "") + fmt(variance)}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <button onClick={() => setBudget(prev => prev.map(x => x.id === b.id ? { ...x, paid: !x.paid } : x))}
                      style={{ background: b.paid ? "#22c55e22" : "#1e293b", color: b.paid ? "#22c55e" : "#475569",
                        border: "none", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12 }}>
                      {b.paid ? "✓ Paid" : "Unpaid"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
