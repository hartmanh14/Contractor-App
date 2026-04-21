import { useApp } from "@/store/AppContext";
import { PHASES } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { StatusBadge, SectionHead } from "@/components/ui";
import { card } from "@/styles/theme";

export default function Dashboard() {
  const { proj, projPermits, projTasks, totalBudgeted, totalActual, totalPaid, safety, safetyPct } = useApp();

  const upcomingTasks = projTasks.filter(t => t.status === "upcoming").slice(0, 5);
  const allInspections = projPermits.flatMap(p => p.inspections.map(i => ({ ...i, permitType: p.type })));
  const nextInspection = allInspections.find(i => i.status === "scheduled");

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {[
          { label: "Budget",   value: fmt(totalBudgeted), sub: `${fmt(totalActual)} spent`,  color: totalActual > totalBudgeted ? "#ef4444" : "#22c55e" },
          { label: "Paid Out", value: fmt(totalPaid),     sub: `${fmt(totalActual - totalPaid)} unpaid`, color: "#f59e0b" },
          { label: "Phase",    value: proj?.phase,        sub: `${PHASES.indexOf(proj?.phase)} of ${PHASES.length - 1} phases`, color: "#3b82f6" },
          { label: "Safety",   value: `${safetyPct}%`,   sub: `${safety.filter(s => s.done).length}/${safety.length} items done`, color: safetyPct < 80 ? "#ef4444" : "#22c55e" },
        ].map(c => (
          <div key={c.label} style={card}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, margin: "6px 0 2px" }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Upcoming tasks */}
        <div style={card}>
          <SectionHead title="Upcoming Tasks" />
          {upcomingTasks.length === 0
            ? <div style={{ color: "#64748b", fontSize: 14 }}>No upcoming tasks</div>
            : upcomingTasks.map(t => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                  <div>
                    <div style={{ fontSize: 14, color: "#e2e8f0" }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{t.phase} · {t.date}</div>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              ))}
        </div>

        {/* Next inspection + permit status */}
        <div style={card}>
          <SectionHead title="Next Inspection" />
          {nextInspection ? (
            <div style={{ padding: "16px 0" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>{nextInspection.name}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 12px" }}>{nextInspection.permitType} Permit · {nextInspection.date}</div>
              <StatusBadge s={nextInspection.status} />
              <div style={{ marginTop: 16, padding: 12, background: "#f59e0b11", borderRadius: 8,
                border: "1px solid #f59e0b33", fontSize: 13, color: "#fcd34d" }}>
                ⚠ Confirm with inspector before scheduled date
              </div>
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: 14, paddingTop: 12 }}>No inspections scheduled</div>
          )}

          <SectionHead title="Permit Status" />
          {projPermits.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
              <div style={{ fontSize: 14, color: "#e2e8f0" }}>{p.type} <span style={{ color: "#64748b", fontSize: 12 }}>#{p.number}</span></div>
              <StatusBadge s={p.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Budget bar */}
      <div style={card}>
        <SectionHead title="Budget Overview" />
        <div style={{ height: 10, background: "#1e293b", borderRadius: 99, overflow: "hidden", margin: "12px 0 8px" }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, (totalActual / totalBudgeted) * 100)}%`,
            background: totalActual > totalBudgeted ? "#ef4444" : "#22c55e",
            borderRadius: 99, transition: "width .5s",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
          <span>Spent: {fmt(totalActual)}</span>
          <span>{Math.round((totalActual / totalBudgeted) * 100)}% of budget</span>
          <span>Budget: {fmt(totalBudgeted)}</span>
        </div>
      </div>
    </div>
  );
}
