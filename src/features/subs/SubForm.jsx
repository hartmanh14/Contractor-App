import { TRADES, SUB_STATUSES } from "@/lib/constants";
import { input, lbl } from "@/styles/theme";

export default function SubForm({ form, setForm }) {
  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  return (
    <div>
      {[["Name", "name"], ["Phone", "phone"], ["Email", "email"]].map(([label, key]) => (
        <div key={key}>
          <label style={lbl}>{label}</label>
          <input style={input} value={form[key]} onChange={e => setF(key, e.target.value)} />
        </div>
      ))}

      <label style={lbl}>Trade</label>
      <select style={input} value={form.trade} onChange={e => setF("trade", e.target.value)}>
        {TRADES.map(t => <option key={t}>{t}</option>)}
      </select>

      <label style={lbl}>Status</label>
      <select style={input} value={form.status} onChange={e => setF("status", e.target.value)}>
        {SUB_STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>

      <label style={lbl}>Rating</label>
      <select style={input} value={form.rating} onChange={e => setF("rating", +e.target.value)}>
        {[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}
      </select>

      <div style={{ display: "flex", gap: 20, marginTop: 12, marginBottom: 12 }}>
        <label style={{ color: "#e2e8f0", fontSize: 14 }}>
          <input type="checkbox" checked={form.licensed} onChange={e => setF("licensed", e.target.checked)} /> Licensed
        </label>
        <label style={{ color: "#e2e8f0", fontSize: 14 }}>
          <input type="checkbox" checked={form.insured} onChange={e => setF("insured", e.target.checked)} /> Insured
        </label>
      </div>

      <label style={lbl}>Notes</label>
      <input style={input} value={form.notes} onChange={e => setF("notes", e.target.value)} />
    </div>
  );
}
