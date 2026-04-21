import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/store/AppContext";
import { TRADES } from "@/lib/constants";
import { generateMockContractors } from "@/lib/utils";
import { fetchNearbyContractors } from "@/lib/api/googlePlaces";
import { card, btnPrimary, input, lbl } from "@/styles/theme";
import { SectionHead } from "@/components/ui";
import ContractorCard from "./ContractorCard";

export default function FindSubs() {
  const { setSubs } = useApp();
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [trade, setTrade] = useState("General Contractor");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());

  function getLocation() {
    if (!navigator.geolocation) { setLocError("Geolocation not supported."); return; }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      ()  => { setLocError("Location access denied. Enable permissions and try again."); setLocating(false); },
      { timeout: 10000 }
    );
  }

  const search = useCallback(async () => {
    if (!location) { getLocation(); return; }
    setSearching(true);
    setSearched(false);

    let data = await fetchNearbyContractors(location.lat, location.lng, trade);
    if (!data) {
      await new Promise(r => setTimeout(r, 900));
      data = generateMockContractors(trade);
    }
    setResults(data);
    setSearching(false);
    setSearched(true);
  }, [location, trade]);

  useEffect(() => { if (location) search(); }, [location]);

  function handleSave(c) {
    setSubs(prev => [...prev, {
      id: Date.now(),
      name: c.name,
      trade: c.trade,
      phone: c.phone || "",
      email: "",
      licensed: c.licensed ?? false,
      insured: c.insured ?? false,
      rating: Math.round(c.googleRating) || 3,
      status: "potential",
      notes: [
        c.googleRating ? `Google: ${c.googleRating}★ (${c.googleReviews} reviews)` : "",
        c.bbbRating ? `BBB: ${c.bbbRating}` : "",
      ].filter(Boolean).join(" · "),
    }]);
    setSavedIds(prev => new Set([...prev, c.id]));
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={card}>
        <SectionHead title="Search Nearby Contractors" />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={lbl}>Trade / Specialty</label>
            <select value={trade} onChange={e => setTrade(e.target.value)} style={input}>
              {TRADES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={lbl}>Location</label>
            <div style={{ ...input, display: "flex", alignItems: "center", gap: 8 }}>
              {location
                ? <span style={{ color: "#22c55e", fontSize: 13 }}>📍 Located ({location.lat.toFixed(3)}, {location.lng.toFixed(3)})</span>
                : <span style={{ color: "#64748b", fontSize: 13 }}>{locating ? "Locating…" : "Not detected"}</span>}
            </div>
          </div>
          <button onClick={location ? search : getLocation} disabled={searching || locating}
            style={{ ...btnPrimary, opacity: searching || locating ? 0.6 : 1 }}>
            {locating ? "Locating…" : searching ? "Searching…" : location ? "🔍 Search" : "📍 Enable Location"}
          </button>
        </div>

        {locError && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#ef444411", border: "1px solid #ef444433", borderRadius: 8, color: "#ef4444", fontSize: 13 }}>
            ⚠ {locError}
          </div>
        )}
        {!import.meta.env.VITE_GOOGLE_PLACES_API_KEY && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#3b82f611", border: "1px solid #3b82f633", borderRadius: 8, color: "#93c5fd", fontSize: 12 }}>
            ℹ Demo mode — showing sample data. Set <code>VITE_GOOGLE_PLACES_API_KEY</code> in <code>.env</code> for live results.
          </div>
        )}
      </div>

      {searching && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div>Searching for {trade} contractors…</div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>No results found. Try a different trade.</div>
      )}

      {results.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>{results.length} contractors found near your location</div>
          {results.map(c => (
            <ContractorCard key={c.id} contractor={c} location={location}
              onSave={() => handleSave(c)} saved={savedIds.has(c.id)} />
          ))}
        </div>
      )}

      {!searched && !searching && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👷</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Find Contractors Near You</div>
          <div style={{ fontSize: 13 }}>Enable location and choose a trade to find nearby contractors with real ratings.</div>
        </div>
      )}
    </div>
  );
}
