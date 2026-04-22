import { useApp } from "@/store/AppContext";

export default function Header() {
  const { proj, appMode, setAppMode } = useApp();

  return (
    <div style={{
      background: "#0a0f1e", borderBottom: "1px solid #1e293b",
      padding: "0 20px", display: "flex", alignItems: "center",
      gap: 16, height: 56, position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-.02em", color: "#f8fafc", flexShrink: 0 }}>
        🏗 <span style={{ color: "#3b82f6" }}>Build</span>Boss
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 2, background: "#1e293b", borderRadius: 8, padding: 3, flexShrink: 0 }}>
        {[
          { key: "contractor", icon: "👷", label: "Contractor" },
          { key: "diy",        icon: "🔧", label: "DIY" },
        ].map(m => (
          <button key={m.key} onClick={() => setAppMode(m.key)} style={{
            padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
            fontWeight: 700, transition: "all .15s",
            background: appMode === m.key ? "#3b82f6" : "transparent",
            color: appMode === m.key ? "#fff" : "#64748b",
          }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "#334155", flex: 1 }}>
        {appMode === "contractor" ? "Owner-Builder Command Center" : "DIY Project Planner"}
      </div>

      {appMode === "contractor" && proj && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: 99, background: "#22c55e" }} />
          <span style={{ fontSize: 12, color: "#64748b" }}>{proj.name}</span>
        </div>
      )}
    </div>
  );
}
