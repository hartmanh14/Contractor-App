import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { TRADES } from "@/lib/constants";
import { StatusBadge, Stars, Pill, Modal } from "@/components/ui";
import { card, btnPrimary, btnSm } from "@/styles/theme";
import SubForm from "./SubForm";

export default function Subs() {
  const { subs, setSubs, setTab } = useApp();
  const [form, setForm] = useState(null);

  function saveForm() {
    setSubs(prev =>
      prev.find(s => s.id === form.id)
        ? prev.map(s => s.id === form.id ? form : s)
        : [...prev, form]
    );
    setForm(null);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>{subs.length} subcontractors</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTab("Find Subs")} style={{ ...btnSm, color: "#3b82f6" }}>🔍 Find Subs</button>
          <button onClick={() => setForm({ id: Date.now(), name: "", trade: TRADES[0], phone: "", email: "", licensed: false, insured: false, rating: 3, status: "potential", notes: "" })}
            style={btnPrimary}>+ Add Manually</button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {subs.map(s => (
          <div key={s.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0" }}>{s.name}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{s.trade}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <StatusBadge s={s.status} />
                <Stars n={s.rating} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 20, margin: "12px 0", flexWrap: "wrap" }}>
              {s.phone && <a href={`tel:${s.phone}`} style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>📞 {s.phone}</a>}
              {s.email && <a href={`mailto:${s.email}`} style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>✉ {s.email}</a>}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Pill label="Licensed" ok={s.licensed} />
              <Pill label="Insured"  ok={s.insured}  />
            </div>

            {s.notes && <div style={{ marginTop: 10, fontSize: 13, color: "#64748b", fontStyle: "italic" }}>"{s.notes}"</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setForm(s)} style={btnSm}>Edit</button>
              <button onClick={() => setSubs(prev => prev.filter(x => x.id !== s.id))}
                style={{ ...btnSm, color: "#ef4444" }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <Modal title={form.name ? "Edit Sub" : "New Subcontractor"} onClose={() => setForm(null)} onSave={saveForm}>
          <SubForm form={form} setForm={setForm} />
        </Modal>
      )}
    </div>
  );
}
