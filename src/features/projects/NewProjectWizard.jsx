import { useState, useRef } from "react";
import { useApp } from "@/store/AppContext";
import { PHASES } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { btnPrimary, btnSm, input, lbl } from "@/styles/theme";

const STEPS = ["Details", "Photos", "Review"];

export default function NewProjectWizard({ onClose }) {
  const { setProjects, setActiveProject } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", address: "", description: "", budget: "",
    startDate: "", endDate: "", phase: "Planning", notes: "", photos: [],
  });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function addPhotos(files) {
    const added = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({ id: Date.now() + Math.random(), url: URL.createObjectURL(f), name: f.name, size: f.size, caption: "" }));
    setForm(f => ({ ...f, photos: [...f.photos, ...added] }));
  }

  function removePhoto(id) { setForm(f => ({ ...f, photos: f.photos.filter(p => p.id !== id) })); }
  function setCaption(id, caption) { setForm(f => ({ ...f, photos: f.photos.map(p => p.id === id ? { ...p, caption } : p) })); }

  const canAdvance = step !== 1 || (form.name.trim() && form.address.trim() && form.budget);

  function save() {
    const project = {
      id: Date.now(),
      name: form.name.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
      budget: parseFloat(form.budget) || 0,
      spent: 0,
      startDate: form.startDate,
      endDate: form.endDate,
      phase: form.phase,
      status: "active",
      notes: form.notes.trim(),
      photos: form.photos,
    };
    setProjects(prev => [...prev, project]);
    setActiveProject(project.id);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18,
        width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", padding: 32 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>Start New Project</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Step {step} of {STEPS.length} — {STEPS[step - 1]}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99,
              background: i < step ? "#3b82f6" : "#1e293b", transition: "background .3s" }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <label style={lbl}>Project Name *</label>
            <input style={input} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Master Bath Renovation" />

            <label style={lbl}>Project Address *</label>
            <input style={input} value={form.address} onChange={e => setF("address", e.target.value)} placeholder="123 Main St, Columbus, OH" />

            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e => setF("description", e.target.value)}
              placeholder="Scope of work, goals, special requirements…"
              rows={4} style={{ ...input, resize: "vertical", lineHeight: 1.5 }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Total Budget *</label>
                <input style={input} type="number" value={form.budget} onChange={e => setF("budget", e.target.value)} placeholder="25000" />
              </div>
              <div>
                <label style={lbl}>Starting Phase</label>
                <select style={input} value={form.phase} onChange={e => setF("phase", e.target.value)}>
                  {PHASES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Start Date</label>
                <input type="date" style={input} value={form.startDate} onChange={e => setF("startDate", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Target End Date</label>
                <input type="date" style={input} value={form.endDate} onChange={e => setF("endDate", e.target.value)} />
              </div>
            </div>

            <label style={lbl}>Notes</label>
            <input style={input} value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Any additional notes…" />
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: 16, fontSize: 14, color: "#94a3b8" }}>
              Upload before photos, problem areas, or reference images.
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragOver ? "#3b82f6" : "#334155"}`, borderRadius: 12,
                padding: "32px 20px", textAlign: "center", cursor: "pointer",
                background: dragOver ? "#3b82f611" : "#0a0f1e", transition: "all .2s", marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>Drag & drop photos here</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>or click to browse · JPG, PNG, HEIC</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={e => addPhotos(e.target.files)} />

            {form.photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                {form.photos.map(photo => (
                  <div key={photo.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #1e293b" }}>
                    <img src={photo.url} alt={photo.name} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                    <button onClick={() => removePhoto(photo.id)}
                      style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 99,
                        background: "#00000088", border: "none", color: "#fff", cursor: "pointer", fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    <div style={{ padding: "6px 8px", background: "#0f172a" }}>
                      <input value={photo.caption} onChange={e => setCaption(photo.id, e.target.value)}
                        placeholder="Caption…" style={{ ...input, padding: "4px 8px", fontSize: 11 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{form.name}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>📍 {form.address}</div>
              {form.description && <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12, lineHeight: 1.6 }}>{form.description}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Budget", value: form.budget ? fmt(parseFloat(form.budget)) : "—" },
                  { label: "Phase",  value: form.phase },
                  { label: "Start",  value: form.startDate || "—" },
                  { label: "End",    value: form.endDate || "—" },
                ].map(r => (
                  <div key={r.label} style={{ padding: "10px 14px", background: "#1e293b", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".07em" }}>{r.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginTop: 2 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {form.photos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                  {form.photos.length} Photo{form.photos.length !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {form.photos.map(p => (
                    <img key={p.id} src={p.url} alt={p.caption || p.name}
                      style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #1e293b" }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: "14px 16px", background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: 10, fontSize: 13, color: "#86efac" }}>
              ✓ Ready to create. Click <strong>Create Project</strong> to add it to your dashboard.
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "space-between" }}>
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)} style={{ ...btnSm, color: "#94a3b8" }}>
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          <button onClick={step < STEPS.length ? () => setStep(s => s + 1) : save}
            disabled={!canAdvance}
            style={{ ...btnPrimary, opacity: canAdvance ? 1 : 0.4 }}>
            {step < STEPS.length ? "Next →" : "✓ Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
