export default function Pill({ label, ok }) {
  const color = ok === null ? "#64748b" : ok ? "#22c55e" : "#ef4444";
  return (
    <span style={{
      fontSize: 12, padding: "2px 10px", borderRadius: 99,
      background: color + "22", color, border: `1px solid ${color}44`,
    }}>
      {ok === null ? "?" : ok ? "✓" : "✗"} {label}
    </span>
  );
}
