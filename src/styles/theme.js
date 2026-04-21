// Shared inline style objects used across components.
// When the app graduates to a CSS framework (Tailwind, CSS Modules, etc.)
// replace these exports one at a time without touching component logic.

export const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: "18px 20px",
};

export const btnPrimary = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

export const btnSm = {
  background: "#1e293b",
  color: "#94a3b8",
  border: "none",
  borderRadius: 6,
  padding: "5px 12px",
  cursor: "pointer",
  fontSize: 13,
};

export const input = {
  width: "100%",
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#e2e8f0",
  padding: "8px 12px",
  fontSize: 14,
  marginBottom: 0,
  boxSizing: "border-box",
};

export const lbl = {
  display: "block",
  fontSize: 12,
  color: "#64748b",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  marginBottom: 6,
  marginTop: 12,
};

export const colors = {
  bg: "#020617",
  surface: "#0f172a",
  surfaceAlt: "#0a0f1e",
  border: "#1e293b",
  borderAlt: "#334155",
  textPrimary: "#f8fafc",
  textSecondary: "#e2e8f0",
  textMuted: "#94a3b8",
  textFaint: "#64748b",
  textDimmed: "#475569",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
  purple: "#a855f7",
};
