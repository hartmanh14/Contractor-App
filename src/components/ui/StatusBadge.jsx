const STATUS_MAP = {
  active:    ["#22c55e", "Active"],
  scheduled: ["#f59e0b", "Scheduled"],
  pending:   ["#64748b", "Pending"],
  passed:    ["#22c55e", "Passed"],
  failed:    ["#ef4444", "Failed"],
  upcoming:  ["#3b82f6", "Upcoming"],
  done:      ["#22c55e", "Done"],
  potential: ["#a855f7", "Potential"],
  inactive:  ["#475569", "Inactive"],
};

export default function StatusBadge({ s }) {
  const [color, label] = STATUS_MAP[s] ?? ["#64748b", s];
  return (
    <span style={{
      background: color + "22", color,
      border: `1px solid ${color}44`,
      padding: "2px 8px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}
