import { useState, useEffect } from "react";

export default function PhotoLightbox({ project, startId, onClose }) {
  const photos = project.photos;
  const startIdx = startId ? photos.findIndex(p => p.id === startId) : 0;
  const [idx, setIdx] = useState(Math.max(0, startIdx));

  useEffect(() => {
    const handler = e => {
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(i - 1, 0));
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [photos.length, onClose]);

  const photo = photos[idx];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000ee", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>
        <img src={photo.url} alt={photo.caption || photo.name}
          style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 10, display: "block" }} />
        {photo.caption && (
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 14, color: "#94a3b8" }}>{photo.caption}</div>
        )}
        <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "#475569" }}>
          {idx + 1} / {photos.length}
        </div>

        <button onClick={onClose} style={{ position: "absolute", top: -16, right: -16, width: 32, height: 32,
          borderRadius: 99, background: "#1e293b", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 18 }}>×</button>

        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)} style={{ position: "absolute", left: -52, top: "50%",
            transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 99,
            background: "#1e293b", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 20 }}>‹</button>
        )}
        {idx < photos.length - 1 && (
          <button onClick={() => setIdx(i => i + 1)} style={{ position: "absolute", right: -52, top: "50%",
            transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 99,
            background: "#1e293b", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 20 }}>›</button>
        )}
      </div>
    </div>
  );
}
