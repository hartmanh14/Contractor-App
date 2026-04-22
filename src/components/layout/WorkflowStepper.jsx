import { useApp } from "@/store/AppContext";
import { WORKFLOW_STAGES } from "@/lib/constants";
import { fmt } from "@/lib/utils";

function stageStatus(id, { proj, subs, projBudget, projPermits, projTasks, safetyPct }) {
  switch (id) {
    case 1: return proj ? "done" : "todo";
    case 2: return projBudget.some(b => b.budgeted > 0) ? "done" : "todo";
    case 3: return subs.some(s => s.status === "active") ? "done" : "todo";
    case 4: return projPermits.length > 0 ? "done" : "todo";
    case 5: return projTasks.length > 0 ? "done" : "todo";
    case 6: return projBudget.some(b => b.actual > 0) ? "done" : "todo";
    case 7: return safetyPct >= 80 ? "done" : "todo";
    default: return "todo";
  }
}

export default function WorkflowStepper() {
  const { stage, setStage, proj, subs, projBudget, projPermits, projTasks, safetyPct, totalBudgeted, totalActual } = useApp();
  const appData = { proj, subs, projBudget, projPermits, projTasks, safetyPct };

  const budgetPct = totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0;
  const activeSubs = subs.filter(s => s.status === "active");
  const allLicensed = activeSubs.length === 0 || activeSubs.every(s => s.licensed);
  const allInsured = activeSubs.length === 0 || activeSubs.every(s => s.insured);
  const paidItems = projBudget.filter(b => b.paid);
  const lienPct = paidItems.length === 0 ? 100 : Math.round((paidItems.filter(b => b.lienWaiver).length / paidItems.length) * 100);

  return (
    <div style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
      {/* Progress steps */}
      <div style={{ overflowX: "auto", padding: "16px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", minWidth: "fit-content", gap: 0, margin: "0 auto", maxWidth: 900 }}>
          {WORKFLOW_STAGES.map((s, i) => {
            const status = stageStatus(s.id, appData);
            const isCurrent = stage === s.id;
            const isDone = status === "done";
            const lineColor = isDone && i < WORKFLOW_STAGES.length - 1 ? "#22c55e" : "#1e293b";

            return (
              <div key={s.id} style={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
                {i > 0 && (
                  <div style={{ width: 28, height: 2, background: lineColor, marginTop: 15, flexShrink: 0 }} />
                )}
                <button
                  onClick={() => setStage(s.id)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: "0 4px 14px" }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isDone && !isCurrent ? 13 : 12, fontWeight: 800,
                    background: isCurrent ? "#3b82f6" : isDone ? "#22c55e" : "#1e293b",
                    color: (isCurrent || isDone) ? "#fff" : "#475569",
                    border: `2px solid ${isCurrent ? "#3b82f6" : isDone ? "#22c55e" : "#334155"}`,
                    boxShadow: isCurrent ? "0 0 0 3px #3b82f622" : "none",
                    transition: "all .2s",
                    flexShrink: 0,
                  }}>
                    {isDone && !isCurrent ? "✓" : s.id}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: ".04em",
                    color: isCurrent ? "#e2e8f0" : isDone ? "#64748b" : "#334155",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                    textDecoration: isCurrent ? "underline" : "none",
                    textUnderlineOffset: 2,
                  }}>
                    {s.short}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project status chips */}
      {proj && (
        <div style={{ display: "flex", gap: 8, padding: "8px 20px 10px", flexWrap: "wrap" }}>
          <StatusChip label={proj.phase} color="#3b82f6" />
          <StatusChip label={`Budget ${budgetPct}%`} color={budgetPct > 100 ? "#ef4444" : "#22c55e"} />
          <StatusChip label={`Safety ${safetyPct}%`} color={safetyPct < 80 ? "#f59e0b" : "#22c55e"} />
          <StatusChip label={`Liens ${lienPct}%`} color={lienPct < 100 && paidItems.length > 0 ? "#f59e0b" : "#22c55e"} />
          {!allLicensed && <StatusChip label="Unlicensed sub" color="#ef4444" alert />}
          {!allInsured && <StatusChip label="Uninsured sub" color="#ef4444" alert />}
        </div>
      )}
    </div>
  );
}

function StatusChip({ label, color, alert }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
      background: color + "18", color, border: `1px solid ${color}33`,
      display: "flex", alignItems: "center", gap: 4,
    }}>
      {alert && "⚠ "}{label}
    </div>
  );
}
