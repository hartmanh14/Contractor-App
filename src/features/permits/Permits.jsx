import { useApp } from "@/store/AppContext";
import { StatusBadge } from "@/components/ui";
import { card } from "@/styles/theme";

export default function Permits() {
  const { projPermits } = useApp();

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {projPermits.map(p => (
        <div key={p.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{p.type} Permit</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>#{p.number} · Issued {p.issued} · Expires {p.expires}</div>
            </div>
            <StatusBadge s={p.status} />
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Inspections
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {p.inspections.map((ins, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>
                    {ins.status === "passed" ? "✓" : ins.status === "scheduled" ? "📅" : ins.status === "failed" ? "✗" : "○"}
                  </span>
                  <div>
                    <div style={{ fontSize: 14, color: "#e2e8f0" }}>{ins.name}</div>
                    {ins.date && <div style={{ fontSize: 11, color: "#64748b" }}>{ins.date}</div>}
                  </div>
                </div>
                <StatusBadge s={ins.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
