import { Stars, Pill } from "@/components/ui";
import { card, btnPrimary } from "@/styles/theme";
import { bbbSearchUrl, googleMapsUrl, yelpSearchUrl } from "@/lib/api/googlePlaces";

export default function ContractorCard({ contractor: c, location, onSave, saved }) {
  const lat = location?.lat;
  const lng = location?.lng;

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 2 }}>{c.name}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>📍 {c.vicinity}</div>

          {/* Rating links */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            {c.googleRating && (
              <RatingBadge href={googleMapsUrl(c.name, c.trade)} icon="🌐" label="Google ↗">
                <Stars n={c.googleRating} small />
                <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>{c.googleRating}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>({c.googleReviews})</span>
              </RatingBadge>
            )}

            <RatingBadge href={bbbSearchUrl(c.name, lat, lng)} icon="🛡" label="BBB ↗">
              {c.bbbRating
                ? <>
                    <span style={{ fontSize: 12, fontWeight: 800, color: c.bbbRating.startsWith("A") ? "#22c55e" : "#f59e0b" }}>{c.bbbRating}</span>
                    {c.bbbAccredited && <span style={{ fontSize: 10, color: "#64748b" }}>Accredited</span>}
                  </>
                : <span style={{ fontSize: 11, color: "#64748b" }}>Check BBB</span>}
            </RatingBadge>

            <RatingBadge href={yelpSearchUrl(c.name, lat, lng)} icon="⭐" label="Yelp ↗">
              <span style={{ fontSize: 11, color: "#64748b" }}>Reviews</span>
            </RatingBadge>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill label="Licensed" ok={c.licensed} />
            <Pill label="Insured"  ok={c.insured}  />
          </div>
          {c.phone && (
            <a href={`tel:${c.phone}`} style={{ display: "block", marginTop: 8, fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>
              📞 {c.phone}
            </a>
          )}
        </div>

        <div>
          {saved
            ? <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>✓ Saved</span>
            : <button onClick={onSave} style={btnPrimary}>+ Add to Subs</button>}
        </div>
      </div>
    </div>
  );
}

function RatingBadge({ href, icon, label, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
        background: "#1e293b", borderRadius: 8, padding: "6px 12px", border: "1px solid #334155" }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      {children}
      <span style={{ fontSize: 10, color: "#3b82f6", marginLeft: 2 }}>{label}</span>
    </a>
  );
}
