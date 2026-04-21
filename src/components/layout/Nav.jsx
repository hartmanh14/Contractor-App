import { useApp } from "@/store/AppContext";
import { TABS } from "@/lib/constants";

export default function Nav() {
  const { tab, setTab } = useApp();

  return (
    <div style={{
      background: "#0a0f1e", borderBottom: "1px solid #1e293b",
      padding: "0 24px", display: "flex", gap: 4, overflowX: "auto",
    }}>
      {TABS.map(t => (
        <button key={t} onClick={() => setTab(t)} style={{
          padding: "12px 16px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", border: "none", background: "transparent",
          color: tab === t ? "#3b82f6" : "#64748b",
          borderBottom: `2px solid ${tab === t ? "#3b82f6" : "transparent"}`,
          whiteSpace: "nowrap",
        }}>
          {t}
        </button>
      ))}
    </div>
  );
}
