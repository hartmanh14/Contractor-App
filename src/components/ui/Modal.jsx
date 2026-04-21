import { btnPrimary, btnSm } from "@/styles/theme";

export default function Modal({ title, children, onClose, onSave, saveLabel = "Save" }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000088",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16,
        padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {children}

        {onSave && (
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ ...btnSm, color: "#94a3b8" }}>Cancel</button>
            <button onClick={onSave} style={btnPrimary}>{saveLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}
