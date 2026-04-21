import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { fmt } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { card, btnPrimary } from "@/styles/theme";
import NewProjectWizard from "./NewProjectWizard";
import PhotoLightbox from "./PhotoLightbox";

export default function Projects() {
  const { projects, activeProject, setActiveProject } = useApp();
  const [showWizard, setShowWizard] = useState(false);
  const [viewPhotos, setViewPhotos] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setShowWizard(true)} style={btnPrimary}>+ New Project</button>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {projects.map(p => (
          <div key={p.id}
            style={{ ...card, cursor: "pointer", border: p.id === activeProject ? "1px solid #3b82f6" : "1px solid #1e293b" }}
            onClick={() => setActiveProject(p.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>📍 {p.address}</div>
                {p.description && (
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, lineHeight: 1.5 }}>{p.description}</div>
                )}
                <div style={{ display: "flex", gap: 20, fontSize: 13, flexWrap: "wrap" }}>
                  <span style={{ color: "#94a3b8" }}>Phase: <b style={{ color: "#e2e8f0" }}>{p.phase}</b></span>
                  <span style={{ color: "#94a3b8" }}>Budget: <b style={{ color: "#e2e8f0" }}>{fmt(p.budget)}</b></span>
                  {p.startDate && <span style={{ color: "#94a3b8" }}>{p.startDate} → {p.endDate}</span>}
                </div>
                {p.notes && <div style={{ marginTop: 8, fontSize: 12, color: "#475569", fontStyle: "italic" }}>{p.notes}</div>}
              </div>
              <StatusBadge s={p.status} />
            </div>

            {p.photos?.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e293b" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".07em" }}>
                  {p.photos.length} Photo{p.photos.length !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {p.photos.slice(0, 6).map(ph => (
                    <img key={ph.id} src={ph.url} alt={ph.caption || ph.name}
                      onClick={e => { e.stopPropagation(); setViewPhotos({ project: p, startId: ph.id }); }}
                      style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8,
                        border: "1px solid #1e293b", cursor: "zoom-in" }} />
                  ))}
                  {p.photos.length > 6 && (
                    <div onClick={e => { e.stopPropagation(); setViewPhotos({ project: p, startId: null }); }}
                      style={{ width: 72, height: 72, borderRadius: 8, background: "#1e293b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 700 }}>
                      +{p.photos.length - 6}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showWizard && <NewProjectWizard onClose={() => setShowWizard(false)} />}
      {viewPhotos && <PhotoLightbox project={viewPhotos.project} startId={viewPhotos.startId} onClose={() => setViewPhotos(null)} />}
    </div>
  );
}
