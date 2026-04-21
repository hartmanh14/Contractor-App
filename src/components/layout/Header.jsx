import { useApp } from "@/store/AppContext";

export default function Header() {
  const { proj } = useApp();

  return (
    <div style={{
      background: "#0a0f1e", borderBottom: "1px solid #1e293b",
      padding: "0 24px", display: "flex", alignItems: "center",
      gap: 20, height: 60, position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-.02em", color: "#f8fafc" }}>
        🏗 <span style={{ color: "#3b82f6" }}>Build</span>Boss
      </div>
      <div style={{ fontSize: 12, color: "#475569", flex: 1 }}>
        Owner-Builder Command Center
      </div>
      {proj && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: "#22c55e" }} />
          <span style={{ fontSize: 12, color: "#64748b" }}>{proj.name}</span>
        </div>
      )}
    </div>
  );
}
