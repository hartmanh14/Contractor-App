import { useState, useEffect, useRef, useCallback } from "react";

// ── CONFIG ────────────────────────────────────────────────────────────────────
// To enable live contractor search, set your Google Places API key here.
// The key must have Places API enabled and your domain whitelisted.
// Without a key the app uses realistic mock data.
const GOOGLE_PLACES_API_KEY = "";

const TABS = ["Dashboard", "Projects", "Find Subs", "Permits", "Subs", "Schedule", "Budget", "Safety"];

const ICONS = {
  dashboard: "⊞", projects: "🏗", permits: "📋", subs: "👷",
  schedule: "📅", budget: "💰", safety: "🦺", add: "+",
  check: "✓", warn: "⚠", del: "×", edit: "✎",
  phone: "📞", email: "✉", doc: "📄", search: "🔍",
};

const PHASES = ["Planning","Demo","Foundation","Framing","Rough-In","Insulation","Drywall","Finishes","Fixtures","Punch-Out","Complete"];

const TRADES = [
  "General Contractor","Plumbing","Electrical","HVAC","Roofing",
  "Framing / Carpentry","Concrete / Masonry","Drywall","Painting",
  "Flooring","Landscaping","Insulation","Windows / Doors","Tile",
];

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
const initialProjects = [
  {
    id: 1, name: "Kitchen Remodel", address: "123 Elm St", phase: "Drywall",
    budget: 42000, spent: 28400, startDate: "2025-03-10", endDate: "2025-06-30",
    status: "active", notes: "Cabinets arrive May 15",
    description: "Full gut remodel — new layout, island, updated plumbing and electrical.",
    photos: [],
  }
];

const initialSubs = [
  { id: 1, name: "Dave's Plumbing", trade: "Plumbing", phone: "937-555-0101", email: "dave@dplumbing.com", licensed: true, insured: true, rating: 5, status: "active", notes: "Very reliable" },
  { id: 2, name: "Bright Electric Co.", trade: "Electrical", phone: "937-555-0202", email: "info@brightelectric.com", licensed: true, insured: true, rating: 4, status: "active", notes: "Sometimes slow to respond" },
  { id: 3, name: "Solid Frames LLC", trade: "Framing / Carpentry", phone: "937-555-0303", email: "solid@frames.com", licensed: false, insured: true, rating: 3, status: "potential", notes: "Need to verify license" },
];

const initialPermits = [
  { id: 1, projectId: 1, type: "Building", number: "BP-2025-0441", issued: "2025-03-01", expires: "2026-03-01", status: "active", inspections: [
    { name: "Footing", date: "2025-03-15", status: "passed" },
    { name: "Rough Framing", date: "2025-04-02", status: "passed" },
    { name: "Rough Plumbing", date: "2025-04-10", status: "passed" },
    { name: "Rough Electrical", date: "2025-04-15", status: "scheduled" },
    { name: "Insulation", date: "", status: "pending" },
    { name: "Final", date: "", status: "pending" },
  ]},
  { id: 2, projectId: 1, type: "Electrical", number: "EP-2025-0112", issued: "2025-03-05", expires: "2026-03-05", status: "active", inspections: [
    { name: "Rough Electrical", date: "2025-04-15", status: "scheduled" },
    { name: "Final Electrical", date: "", status: "pending" },
  ]},
];

const initialTasks = [
  { id: 1, projectId: 1, title: "Frame inspection sign-off", subId: null, date: "2025-04-02", status: "done", phase: "Framing" },
  { id: 2, projectId: 1, title: "Rough plumbing - Dave's Plumbing", subId: 1, date: "2025-04-08", status: "done", phase: "Rough-In" },
  { id: 3, projectId: 1, title: "Rough electrical - Bright Electric", subId: 2, date: "2025-04-14", status: "done", phase: "Rough-In" },
  { id: 4, projectId: 1, title: "Electrical rough-in inspection", subId: null, date: "2025-04-15", status: "upcoming", phase: "Rough-In" },
  { id: 5, projectId: 1, title: "Insulation install", subId: null, date: "2025-04-22", status: "upcoming", phase: "Insulation" },
  { id: 6, projectId: 1, title: "Drywall hang - day 1", subId: null, date: "2025-04-28", status: "upcoming", phase: "Drywall" },
  { id: 7, projectId: 1, title: "Cabinet delivery & install", subId: null, date: "2025-05-15", status: "upcoming", phase: "Finishes" },
];

const initialBudget = [
  { id: 1, projectId: 1, category: "Demo & Haul-Off", budgeted: 1800, actual: 1650, paid: true },
  { id: 2, projectId: 1, category: "Plumbing - Rough", budgeted: 4200, actual: 4200, paid: true },
  { id: 3, projectId: 1, category: "Electrical - Rough", budgeted: 3800, actual: 3900, paid: true },
  { id: 4, projectId: 1, category: "Insulation", budgeted: 1400, actual: 0, paid: false },
  { id: 5, projectId: 1, category: "Drywall", budgeted: 3200, actual: 0, paid: false },
  { id: 6, projectId: 1, category: "Cabinets & Hardware", budgeted: 11000, actual: 10800, paid: false },
  { id: 7, projectId: 1, category: "Countertops", budgeted: 4500, actual: 0, paid: false },
  { id: 8, projectId: 1, category: "Tile & Flooring", budgeted: 3800, actual: 3850, paid: true },
  { id: 9, projectId: 1, category: "Fixtures & Appliances", budgeted: 6200, actual: 0, paid: false },
  { id: 10, projectId: 1, category: "Paint", budgeted: 900, actual: 0, paid: false },
  { id: 11, projectId: 1, category: "Permits & Fees", budgeted: 1200, actual: 1150, paid: true },
];

const initialSafetyItems = [
  { id: 1, text: "First aid kit on-site", done: true },
  { id: 2, text: "Fire extinguisher accessible", done: true },
  { id: 3, text: "All subs carry liability insurance", done: true },
  { id: 4, text: "Hard hats available for visitors", done: false },
  { id: 5, text: "Electrical panels clearly labeled", done: false },
  { id: 6, text: "Walkways clear of debris daily", done: true },
  { id: 7, text: "OSHA safety poster posted", done: false },
  { id: 8, text: "Emergency contacts posted on-site", done: true },
];

// ── MOCK CONTRACTOR DATA ──────────────────────────────────────────────────────
function generateMockContractors(trade, city = "your area") {
  const bases = {
    "General Contractor": ["Summit Build Group","Cornerstone Construction","Apex Builders","Homestead GC","Ridgeline Contracting"],
    "Plumbing": ["PipeMasters LLC","Reliable Plumbing Co.","Flow Right Services","Clear Drain Plumbing","AquaPro Solutions"],
    "Electrical": ["Volt Solutions","Spark Electric","CurrentTech","ProWire Electric","Bright Side Electric"],
    "HVAC": ["ComfortZone HVAC","Arctic Air Systems","TempRight Inc.","ClimateControl Pro","Cool Breeze Services"],
    "Roofing": ["Summit Roofing","Peak Shield Roofing","Overhead Pros","StormGuard Roofing","Apex Roof & Gutter"],
    "Framing / Carpentry": ["Precision Framing LLC","Timber & Nail Co.","FrameRight Builders","SturdiFrame Inc.","Woodcraft Framing"],
    "Concrete / Masonry": ["SolidBase Concrete","Masonry Masters","Foundation Pros","StoneSet LLC","Level Ground Inc."],
    "Drywall": ["SmoothFinish LLC","DryWall Direct","Board & Tape Co.","ProWall Services","Seamless Drywall"],
    "Painting": ["ColorPro Painters","Elite Finish Co.","PaintRight LLC","True Coat Painting","Premier Brush Works"],
    "Flooring": ["FloorKing","Surface Solutions","Precision Flooring Co.","TopGrain Floors","All-Floor Pros"],
  };

  const names = bases[trade] || bases["General Contractor"];
  const ratings = [4.9, 4.7, 4.5, 4.3, 4.1, 3.9, 4.8, 4.6];
  const bbbRatings = ["A+", "A+", "A", "A", "A-", "B+", "A+", "A"];
  const reviewCounts = [312, 87, 224, 45, 178, 63, 140, 29];

  return names.slice(0, 6).map((name, i) => ({
    id: `mock-${i}`,
    name,
    trade,
    vicinity: `${(Math.random() * 8 + 0.5).toFixed(1)} mi · ${city}`,
    phone: `(${Math.floor(Math.random()*800+100)}) ${Math.floor(Math.random()*900+100)}-${Math.floor(Math.random()*9000+1000)}`,
    googleRating: ratings[i % ratings.length],
    googleReviews: reviewCounts[i % reviewCounts.length],
    bbbRating: bbbRatings[i % bbbRatings.length],
    bbbAccredited: i % 3 !== 2,
    licensed: i % 5 !== 4,
    insured: i % 6 !== 5,
    source: "mock",
  }));
}

async function fetchNearbyContractors(lat, lng, trade, apiKey) {
  if (!apiKey) return null;
  const keyword = encodeURIComponent(trade + " contractor");
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=24000&keyword=${keyword}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results) return null;
    return data.results.slice(0, 8).map(p => ({
      id: p.place_id,
      name: p.name,
      trade,
      vicinity: p.vicinity,
      phone: "",
      googleRating: p.rating ?? null,
      googleReviews: p.user_ratings_total ?? 0,
      bbbRating: null,
      bbbAccredited: false,
      licensed: null,
      insured: null,
      source: "google",
    }));
  } catch {
    return null;
  }
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [projects, setProjects] = useState(initialProjects);
  const [subs, setSubs] = useState(initialSubs);
  const [permits, setPermits] = useState(initialPermits);
  const [tasks, setTasks] = useState(initialTasks);
  const [budget, setBudget] = useState(initialBudget);
  const [safety, setSafety] = useState(initialSafetyItems);
  const [activeProject, setActiveProject] = useState(1);
  const [modal, setModal] = useState(null);

  const proj = projects.find(p => p.id === activeProject);
  const projBudget = budget.filter(b => b.projectId === activeProject);
  const projTasks = tasks.filter(t => t.projectId === activeProject);
  const projPermits = permits.filter(p => p.projectId === activeProject);

  const totalBudgeted = projBudget.reduce((s, b) => s + b.budgeted, 0);
  const totalActual = projBudget.reduce((s, b) => s + b.actual, 0);
  const totalPaid = projBudget.filter(b => b.paid).reduce((s, b) => s + b.actual, 0);
  const upcomingTasks = projTasks.filter(t => t.status === "upcoming").slice(0, 5);
  const safetyPct = Math.round((safety.filter(s => s.done).length / safety.length) * 100);
  const allInspections = projPermits.flatMap(p => p.inspections.map(i => ({ ...i, permitType: p.type })));
  const nextInspection = allInspections.find(i => i.status === "scheduled");

  function fmt(n) { return "$" + n.toLocaleString(); }

  function StatusBadge({ s }) {
    const map = {
      active: ["#22c55e","Active"], scheduled: ["#f59e0b","Scheduled"],
      pending: ["#64748b","Pending"], passed: ["#22c55e","Passed"],
      failed: ["#ef4444","Failed"], upcoming: ["#3b82f6","Upcoming"],
      done: ["#22c55e","Done"], potential: ["#a855f7","Potential"],
    };
    const [color, label] = map[s] || ["#64748b", s];
    return (
      <span style={{ background: color+"22", color, border: `1px solid ${color}44`,
        padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: ".04em" }}>
        {label}
      </span>
    );
  }

  function Stars({ n, max = 5, small }) {
    const size = small ? 12 : 15;
    return (
      <span style={{ color: "#f59e0b", fontSize: size }}>
        {Array.from({ length: max }, (_, i) => i < Math.round(n) ? "★" : "☆").join("")}
      </span>
    );
  }

  function SectionHead({ title }) {
    return <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>{title}</div>;
  }

  function Pill({ label, ok }) {
    return (
      <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 99,
        background: ok ? "#22c55e22" : ok === null ? "#33415522" : "#ef444422",
        color: ok ? "#22c55e" : ok === null ? "#64748b" : "#ef4444",
        border: `1px solid ${ok ? "#22c55e" : ok === null ? "#334155" : "#ef4444"}44` }}>
        {ok === null ? "?" : ok ? "✓" : "✗"} {label}
      </span>
    );
  }

  // ── FIND SUBS ──────────────────────────────────────────────────────────────
  function FindSubs() {
    const [location, setLocation] = useState(null);
    const [locError, setLocError] = useState(null);
    const [locating, setLocating] = useState(false);
    const [trade, setTrade] = useState("General Contractor");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());

    const getLocation = () => {
      if (!navigator.geolocation) { setLocError("Geolocation not supported by your browser."); return; }
      setLocating(true);
      setLocError(null);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        err => {
          setLocError("Location access denied. Enable location permissions to search nearby.");
          setLocating(false);
        },
        { timeout: 10000 }
      );
    };

    const search = useCallback(async () => {
      if (!location) { getLocation(); return; }
      setSearching(true);
      setSearched(false);

      let data = await fetchNearbyContractors(location.lat, location.lng, trade, GOOGLE_PLACES_API_KEY);
      if (!data) {
        // fall back to realistic mock data
        await new Promise(r => setTimeout(r, 900));
        const city = location.city || "your area";
        data = generateMockContractors(trade, city);
      }
      setResults(data);
      setSearching(false);
      setSearched(true);
    }, [location, trade]);

    useEffect(() => { if (location) search(); }, [location]);

    function saveToSubs(c) {
      const newSub = {
        id: Date.now(),
        name: c.name,
        trade: c.trade,
        phone: c.phone || "",
        email: "",
        licensed: c.licensed ?? false,
        insured: c.insured ?? false,
        rating: Math.round(c.googleRating) || 3,
        status: "potential",
        notes: c.googleRating ? `Google: ${c.googleRating}★ (${c.googleReviews} reviews)${c.bbbRating ? ` · BBB: ${c.bbbRating}` : ""}` : "",
      };
      setSubs(prev => [...prev, newSub]);
      setSavedIds(prev => new Set([...prev, c.id]));
    }

    function bbbUrl(name) {
      return `https://www.bbb.org/search?find_text=${encodeURIComponent(name)}&find_loc=${location ? `${location.lat},${location.lng}` : ""}`;
    }

    function googleMapsUrl(name) {
      const q = encodeURIComponent(name + " " + trade);
      return `https://www.google.com/maps/search/${q}`;
    }

    function yelpUrl(name) {
      return `https://www.yelp.com/search?find_desc=${encodeURIComponent(name)}&find_loc=${location ? `${location.lat},${location.lng}` : "near+me"}`;
    }

    return (
      <div style={{ display: "grid", gap: 20 }}>
        {/* Location + Search bar */}
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
              <div style={{ ...input, display: "flex", alignItems: "center", gap: 8, cursor: "default", marginBottom: 0 }}>
                {location
                  ? <span style={{ color: "#22c55e", fontSize: 13 }}>📍 Located ({location.lat.toFixed(3)}, {location.lng.toFixed(3)})</span>
                  : <span style={{ color: "#64748b", fontSize: 13 }}>{locating ? "Locating…" : "Location not detected"}</span>}
              </div>
            </div>
            <button onClick={location ? search : getLocation} disabled={searching || locating}
              style={{ ...btnPrimary, opacity: searching || locating ? 0.6 : 1, whiteSpace: "nowrap" }}>
              {locating ? "Getting location…" : searching ? "Searching…" : location ? "🔍 Search" : "📍 Enable Location"}
            </button>
          </div>
          {locError && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#ef444411", border: "1px solid #ef444433", borderRadius: 8, color: "#ef4444", fontSize: 13 }}>
              ⚠ {locError}
            </div>
          )}
          {!GOOGLE_PLACES_API_KEY && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#3b82f611", border: "1px solid #3b82f633", borderRadius: 8, color: "#93c5fd", fontSize: 12 }}>
              ℹ Demo mode — showing sample contractors. Set <code>GOOGLE_PLACES_API_KEY</code> at top of file for live results.
            </div>
          )}
        </div>

        {/* Results */}
        {searching && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div>Searching for {trade} contractors nearby…</div>
          </div>
        )}

        {searched && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>No results found. Try a different trade.</div>
        )}

        {results.length > 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>{results.length} contractors found near your location</div>
            {results.map(c => (
              <div key={c.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>📍 {c.vicinity}</div>

                    {/* Ratings row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 12 }}>
                      {/* Google rating */}
                      {c.googleRating && (
                        <a href={googleMapsUrl(c.name)} target="_blank" rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
                            background: "#1e293b", borderRadius: 8, padding: "6px 12px", border: "1px solid #334155" }}>
                          <span style={{ fontSize: 13 }}>🌐</span>
                          <Stars n={c.googleRating} small />
                          <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>{c.googleRating}</span>
                          <span style={{ fontSize: 11, color: "#64748b" }}>({c.googleReviews} reviews)</span>
                          <span style={{ fontSize: 10, color: "#3b82f6", marginLeft: 2 }}>Google ↗</span>
                        </a>
                      )}

                      {/* BBB rating */}
                      <a href={bbbUrl(c.name)} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
                          background: "#1e293b", borderRadius: 8, padding: "6px 12px", border: "1px solid #334155" }}>
                        <span style={{ fontSize: 13 }}>🛡</span>
                        {c.bbbRating
                          ? <>
                              <span style={{ fontSize: 12, color: c.bbbRating.startsWith("A") ? "#22c55e" : "#f59e0b", fontWeight: 800 }}>{c.bbbRating}</span>
                              {c.bbbAccredited && <span style={{ fontSize: 10, color: "#64748b" }}>Accredited</span>}
                            </>
                          : <span style={{ fontSize: 11, color: "#64748b" }}>Check BBB</span>}
                        <span style={{ fontSize: 10, color: "#3b82f6", marginLeft: 2 }}>BBB ↗</span>
                      </a>

                      {/* Yelp link */}
                      <a href={yelpUrl(c.name)} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
                          background: "#1e293b", borderRadius: 8, padding: "6px 12px", border: "1px solid #334155" }}>
                        <span style={{ fontSize: 13 }}>⭐</span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Yelp Reviews</span>
                        <span style={{ fontSize: 10, color: "#3b82f6", marginLeft: 2 }}>↗</span>
                      </a>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Pill label="Licensed" ok={c.licensed} />
                      <Pill label="Insured" ok={c.insured} />
                    </div>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} style={{ display: "block", marginTop: 8, fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>📞 {c.phone}</a>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    {savedIds.has(c.id)
                      ? <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>✓ Saved to Subs</span>
                      : <button onClick={() => saveToSubs(c)} style={btnPrimary}>+ Add to Subs</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searched && !searching && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👷</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Find Contractors Near You</div>
            <div style={{ fontSize: 13 }}>Enable location access and choose a trade to search for nearby contractors with real ratings.</div>
          </div>
        )}
      </div>
    );
  }

  // ── NEW PROJECT WIZARD ─────────────────────────────────────────────────────
  function NewProjectWizard({ onClose }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
      name: "", address: "", description: "", budget: "",
      startDate: "", endDate: "", phase: "Planning", notes: "",
      photos: [],
    });
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

    function addPhotos(files) {
      const newPhotos = [];
      Array.from(files).forEach(file => {
        if (!file.type.startsWith("image/")) return;
        const url = URL.createObjectURL(file);
        newPhotos.push({ id: Date.now() + Math.random(), url, name: file.name, size: file.size, caption: "" });
      });
      setForm(f => ({ ...f, photos: [...f.photos, ...newPhotos] }));
    }

    function removePhoto(id) { setForm(f => ({ ...f, photos: f.photos.filter(p => p.id !== id) })); }
    function setCaption(id, caption) { setForm(f => ({ ...f, photos: f.photos.map(p => p.id === id ? { ...p, caption } : p) })); }

    function canAdvance() {
      if (step === 1) return form.name.trim() && form.address.trim() && form.budget;
      return true;
    }

    function save() {
      const newProj = {
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
      setProjects(prev => [...prev, newProj]);
      setActiveProject(newProj.id);
      onClose();
    }

    const steps = ["Details", "Photos", "Review"];

    return (
      <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18,
          width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", padding: 32 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>Start New Project</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Step {step} of {steps.length} — {steps[step - 1]}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 99,
                background: i < step ? "#3b82f6" : "#1e293b", transition: "background .3s" }} />
            ))}
          </div>

          {/* Step 1: Details */}
          {step === 1 && (
            <div>
              <label style={lbl}>Project Name *</label>
              <input style={input} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Master Bath Renovation" />

              <label style={lbl}>Project Address *</label>
              <input style={input} value={form.address} onChange={e => setF("address", e.target.value)} placeholder="123 Main St, Columbus, OH" />

              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setF("description", e.target.value)}
                placeholder="Describe what needs to be done — scope of work, goals, special requirements…"
                rows={4}
                style={{ ...input, resize: "vertical", lineHeight: 1.5 }} />

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

          {/* Step 2: Photos */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 16, fontSize: 14, color: "#94a3b8" }}>
                Upload photos of the work area — before shots, problem areas, reference images.
              </div>

              {/* Drop zone */}
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
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>or click to browse files</div>
                <div style={{ fontSize: 11, color: "#334155", marginTop: 8 }}>JPG, PNG, HEIC · Multiple files supported</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                onChange={e => addPhotos(e.target.files)} />

              {/* Photo grid */}
              {form.photos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  {form.photos.map(photo => (
                    <div key={photo.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #1e293b" }}>
                      <img src={photo.url} alt={photo.name}
                        style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                      <button onClick={() => removePhoto(photo.id)}
                        style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 99,
                          background: "#00000088", border: "none", color: "#fff", cursor: "pointer", fontSize: 14,
                          display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      <div style={{ padding: "6px 8px", background: "#0f172a" }}>
                        <input value={photo.caption} onChange={e => setCaption(photo.id, e.target.value)}
                          placeholder="Add caption…"
                          style={{ ...input, padding: "4px 8px", fontSize: 11, marginBottom: 0 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {form.photos.length === 0 && (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#475569", fontSize: 13 }}>
                  No photos yet — you can add them later from the project view.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <div style={{ ...card, background: "#0a0f1e", marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{form.name}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>📍 {form.address}</div>
                {form.description && (
                  <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12, lineHeight: 1.6 }}>{form.description}</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Budget", value: form.budget ? fmt(parseFloat(form.budget)) : "—" },
                    { label: "Phase", value: form.phase },
                    { label: "Start", value: form.startDate || "—" },
                    { label: "End", value: form.endDate || "—" },
                  ].map(r => (
                    <div key={r.label} style={{ padding: "10px 14px", background: "#1e293b", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".07em" }}>{r.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginTop: 2 }}>{r.value}</div>
                    </div>
                  ))}
                </div>
                {form.notes && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#64748b", fontStyle: "italic" }}>Notes: {form.notes}</div>
                )}
              </div>
              {form.photos.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                    {form.photos.length} Photo{form.photos.length !== 1 ? "s" : ""} Attached
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
                ✓ Ready to create project. Click <strong>Create Project</strong> to add it to your dashboard.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "space-between" }}>
            <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
              style={{ ...btnSm, color: "#94a3b8" }}>
              {step === 1 ? "Cancel" : "← Back"}
            </button>
            <button
              onClick={step < steps.length ? () => setStep(s => s + 1) : save}
              disabled={!canAdvance()}
              style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.4 }}>
              {step < steps.length ? "Next →" : "✓ Create Project"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  function Dashboard() {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { label: "Budget", value: fmt(totalBudgeted), sub: `${fmt(totalActual)} spent`, color: totalActual > totalBudgeted ? "#ef4444" : "#22c55e" },
            { label: "Paid Out", value: fmt(totalPaid), sub: `${fmt(totalActual - totalPaid)} unpaid`, color: "#f59e0b" },
            { label: "Phase", value: proj?.phase, sub: `${PHASES.indexOf(proj?.phase)} of ${PHASES.length - 1} phases`, color: "#3b82f6" },
            { label: "Safety", value: `${safetyPct}%`, sub: `${safety.filter(s => s.done).length}/${safety.length} items done`, color: safetyPct < 80 ? "#ef4444" : "#22c55e" },
          ].map(c => (
            <div key={c.label} style={card}>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color, margin: "6px 0 2px" }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={card}>
            <SectionHead title="Upcoming Tasks" />
            {upcomingTasks.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                <div>
                  <div style={{ fontSize: 14, color: "#e2e8f0" }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{t.phase} · {t.date}</div>
                </div>
                <StatusBadge s={t.status} />
              </div>
            ))}
          </div>

          <div style={card}>
            <SectionHead title="Next Inspection" />
            {nextInspection ? (
              <div style={{ padding: "16px 0" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>{nextInspection.name}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 12px" }}>{nextInspection.permitType} Permit · {nextInspection.date}</div>
                <StatusBadge s={nextInspection.status} />
                <div style={{ marginTop: 16, padding: 12, background: "#f59e0b11", borderRadius: 8,
                  border: "1px solid #f59e0b33", fontSize: 13, color: "#fcd34d" }}>
                  ⚠ Make sure rough electrical is complete and inspector has been contacted
                </div>
              </div>
            ) : <div style={{ color: "#64748b", fontSize: 14, paddingTop: 12 }}>No inspections scheduled</div>}

            <SectionHead title="Permit Status" style={{ marginTop: 16 }} />
            {projPermits.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                <div style={{ fontSize: 14, color: "#e2e8f0" }}>{p.type} <span style={{ color: "#64748b", fontSize: 12 }}>#{p.number}</span></div>
                <StatusBadge s={p.status} />
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <SectionHead title="Budget Overview" />
          <div style={{ height: 10, background: "#1e293b", borderRadius: 99, overflow: "hidden", margin: "12px 0 8px" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (totalActual / totalBudgeted) * 100)}%`,
              background: totalActual > totalBudgeted ? "#ef4444" : "#22c55e", borderRadius: 99, transition: "width .5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
            <span>Spent: {fmt(totalActual)}</span>
            <span>{Math.round((totalActual / totalBudgeted) * 100)}% of budget</span>
            <span>Budget: {fmt(totalBudgeted)}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── PROJECTS ───────────────────────────────────────────────────────────────
  function Projects() {
    const [showWizard, setShowWizard] = useState(false);
    const [viewPhotos, setViewPhotos] = useState(null);

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => setShowWizard(true)} style={btnPrimary}>+ New Project</button>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {projects.map(p => (
            <div key={p.id} style={{ ...card, cursor: "pointer", border: p.id === activeProject ? "1px solid #3b82f6" : "1px solid #1e293b" }}
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
                    <span style={{ color: "#94a3b8" }}>{p.startDate} → {p.endDate}</span>
                  </div>
                  {p.notes && <div style={{ marginTop: 8, fontSize: 12, color: "#475569", fontStyle: "italic" }}>{p.notes}</div>}
                </div>
                <StatusBadge s={p.status} />
              </div>

              {/* Photo thumbnails */}
              {p.photos && p.photos.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".07em" }}>
                    {p.photos.length} Photo{p.photos.length !== 1 ? "s" : ""}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {p.photos.slice(0, 6).map(ph => (
                      <div key={ph.id} onClick={e => { e.stopPropagation(); setViewPhotos({ project: p, start: ph.id }); }}
                        style={{ position: "relative", cursor: "zoom-in" }}>
                        <img src={ph.url} alt={ph.caption || ph.name}
                          style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #1e293b" }} />
                      </div>
                    ))}
                    {p.photos.length > 6 && (
                      <div onClick={e => { e.stopPropagation(); setViewPhotos({ project: p, start: null }); }}
                        style={{ width: 72, height: 72, borderRadius: 8, background: "#1e293b", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
                          fontSize: 13, color: "#64748b", fontWeight: 700 }}>
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

        {/* Photo lightbox */}
        {viewPhotos && (
          <PhotoLightbox project={viewPhotos.project} startId={viewPhotos.start} onClose={() => setViewPhotos(null)} />
        )}
      </div>
    );
  }

  // ── PHOTO LIGHTBOX ─────────────────────────────────────────────────────────
  function PhotoLightbox({ project, startId, onClose }) {
    const photos = project.photos;
    const startIdx = startId ? photos.findIndex(p => p.id === startId) : 0;
    const [idx, setIdx] = useState(Math.max(0, startIdx));

    useEffect(() => {
      const handler = e => {
        if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, photos.length - 1));
        if (e.key === "ArrowLeft") setIdx(i => Math.max(i - 1, 0));
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [photos.length]);

    const photo = photos[idx];

    return (
      <div style={{ position: "fixed", inset: 0, background: "#000000ee", zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={onClose}>
        <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
          <img src={photo.url} alt={photo.caption || photo.name}
            style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 10, display: "block" }} />
          {photo.caption && (
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 14, color: "#94a3b8" }}>{photo.caption}</div>
          )}
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "#475569" }}>{idx + 1} / {photos.length}</div>
          <button onClick={onClose} style={{ position: "absolute", top: -16, right: -16, width: 32, height: 32,
            borderRadius: 99, background: "#1e293b", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 18 }}>×</button>
          {idx > 0 && (
            <button onClick={() => setIdx(i => i - 1)} style={{ position: "absolute", left: -52, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: 99, background: "#1e293b", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 20 }}>‹</button>
          )}
          {idx < photos.length - 1 && (
            <button onClick={() => setIdx(i => i + 1)} style={{ position: "absolute", right: -52, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: 99, background: "#1e293b", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 20 }}>›</button>
          )}
        </div>
      </div>
    );
  }

  // ── PERMITS ────────────────────────────────────────────────────────────────
  function Permits() {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        {projPermits.map(p => (
          <div key={p.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{p.type} Permit</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>#{p.number} · Issued {p.issued} · Expires {p.expires}</div>
              </div>
              <StatusBadge s={p.status} />
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Inspections</div>
            <div style={{ display: "grid", gap: 8 }}>
              {p.inspections.map((ins, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{ins.status === "passed" ? "✓" : ins.status === "scheduled" ? "📅" : ins.status === "failed" ? "✗" : "○"}</span>
                    <div>
                      <div style={{ fontSize: 14, color: "#e2e8f0" }}>{ins.name}</div>
                      {ins.date && <div style={{ fontSize: 11, color: "#64748b" }}>{ins.date}</div>}
                    </div>
                  </div>
                  <StatusBadge s={ins.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── SUBS ───────────────────────────────────────────────────────────────────
  function Subs() {
    const [form, setForm] = useState(null);
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>{subs.length} subcontractors</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setTab("Find Subs")} style={{ ...btnSm, color: "#3b82f6" }}>🔍 Find New Subs</button>
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
                <Pill label="Insured" ok={s.insured} />
              </div>
              {s.notes && <div style={{ marginTop: 10, fontSize: 13, color: "#64748b", fontStyle: "italic" }}>"{s.notes}"</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => setForm(s)} style={btnSm}>Edit</button>
                <button onClick={() => setSubs(prev => prev.filter(x => x.id !== s.id))} style={{ ...btnSm, color: "#ef4444" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {form && (
          <Modal title={form.name ? "Edit Sub" : "New Subcontractor"} onClose={() => setForm(null)}
            onSave={() => { setSubs(prev => prev.find(s => s.id === form.id) ? prev.map(s => s.id === form.id ? form : s) : [...prev, form]); setForm(null); }}>
            <SubForm form={form} setForm={setForm} />
          </Modal>
        )}
      </div>
    );
  }

  function SubForm({ form, setForm }) {
    return (
      <div>
        {[["Name","name"],["Phone","phone"],["Email","email"]].map(([l,k]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <label style={lbl}>{l}</label>
            <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={input} />
          </div>
        ))}
        <label style={lbl}>Trade</label>
        <select value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} style={{ ...input, marginBottom: 12 }}>
          {TRADES.map(t => <option key={t}>{t}</option>)}
        </select>
        <label style={lbl}>Status</label>
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...input, marginBottom: 12 }}>
          {["potential","active","inactive"].map(s => <option key={s}>{s}</option>)}
        </select>
        <label style={lbl}>Rating</label>
        <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} style={{ ...input, marginBottom: 12 }}>
          {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
        </select>
        <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
          <label style={{ color: "#e2e8f0", fontSize: 14 }}><input type="checkbox" checked={form.licensed} onChange={e => setForm(f => ({ ...f, licensed: e.target.checked }))} /> Licensed</label>
          <label style={{ color: "#e2e8f0", fontSize: 14 }}><input type="checkbox" checked={form.insured} onChange={e => setForm(f => ({ ...f, insured: e.target.checked }))} /> Insured</label>
        </div>
        <label style={lbl}>Notes</label>
        <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={input} />
      </div>
    );
  }

  // ── SCHEDULE ───────────────────────────────────────────────────────────────
  function Schedule() {
    const [newTask, setNewTask] = useState(null);
    const grouped = PHASES.reduce((acc, ph) => {
      const t = projTasks.filter(t => t.phase === ph);
      if (t.length) acc[ph] = t;
      return acc;
    }, {});
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => setNewTask({ id: Date.now(), projectId: activeProject, title: "", subId: null, date: "", status: "upcoming", phase: proj.phase })}
            style={btnPrimary}>+ Add Task</button>
        </div>
        {Object.entries(grouped).map(([ph, ts]) => (
          <div key={ph} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{ph}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {ts.map(t => (
                <div key={t.id} style={{ ...card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: x.status === "done" ? "upcoming" : "done" } : x))}
                      style={{ width: 22, height: 22, borderRadius: 99, border: "2px solid",
                        borderColor: t.status === "done" ? "#22c55e" : "#334155",
                        background: t.status === "done" ? "#22c55e" : "transparent",
                        color: "#fff", cursor: "pointer", fontSize: 12,
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {t.status === "done" ? "✓" : ""}
                    </button>
                    <div>
                      <div style={{ fontSize: 14, color: t.status === "done" ? "#475569" : "#e2e8f0", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{t.date}{t.subId ? ` · ${subs.find(s => s.id === t.subId)?.name}` : ""}</div>
                    </div>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {newTask && (
          <Modal title="New Task" onClose={() => setNewTask(null)}
            onSave={() => { setTasks(prev => [...prev, newTask]); setNewTask(null); }}>
            <div>
              <label style={lbl}>Title</label>
              <input style={input} value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
              <label style={lbl}>Date</label>
              <input type="date" style={input} value={newTask.date} onChange={e => setNewTask(t => ({ ...t, date: e.target.value }))} />
              <label style={lbl}>Phase</label>
              <select style={input} value={newTask.phase} onChange={e => setNewTask(t => ({ ...t, phase: e.target.value }))}>
                {PHASES.map(p => <option key={p}>{p}</option>)}
              </select>
              <label style={lbl}>Subcontractor</label>
              <select style={input} value={newTask.subId || ""} onChange={e => setNewTask(t => ({ ...t, subId: e.target.value ? +e.target.value : null }))}>
                <option value="">None</option>
                {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ── BUDGET ─────────────────────────────────────────────────────────────────
  function Budget() {
    const over = totalActual > totalBudgeted;
    return (
      <div>
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, textAlign: "center" }}>
            {[
              { label: "Total Budget", val: fmt(totalBudgeted), color: "#94a3b8" },
              { label: "Total Actual", val: fmt(totalActual), color: over ? "#ef4444" : "#22c55e" },
              { label: "Remaining", val: fmt(totalBudgeted - totalActual), color: over ? "#ef4444" : "#3b82f6" },
            ].map(x => (
              <div key={x.label}>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>{x.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: x.color, marginTop: 4 }}>{x.val}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden", marginTop: 20 }}>
            <div style={{ height: "100%", width: `${Math.min(100, (totalActual / totalBudgeted) * 100)}%`,
              background: over ? "#ef4444" : "#22c55e", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {["Category","Budgeted","Actual","Variance","Paid"].map(h => (
                  <th key={h} style={{ textAlign: h === "Category" ? "left" : "right", padding: "8px 12px",
                    color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projBudget.map(b => {
                const variance = b.budgeted - b.actual;
                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "10px 12px", color: "#e2e8f0" }}>{b.category}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#94a3b8" }}>{fmt(b.budgeted)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: b.actual ? "#e2e8f0" : "#475569" }}>{b.actual ? fmt(b.actual) : "—"}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: b.actual === 0 ? "#475569" : variance >= 0 ? "#22c55e" : "#ef4444" }}>
                      {b.actual === 0 ? "—" : (variance >= 0 ? "+" : "") + fmt(variance)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button onClick={() => setBudget(prev => prev.map(x => x.id === b.id ? { ...x, paid: !x.paid } : x))}
                        style={{ background: b.paid ? "#22c55e22" : "#1e293b", color: b.paid ? "#22c55e" : "#475569",
                          border: "none", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12 }}>
                        {b.paid ? "✓ Paid" : "Unpaid"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── SAFETY ─────────────────────────────────────────────────────────────────
  function Safety() {
    const [newItem, setNewItem] = useState("");
    return (
      <div>
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Site Safety Score</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: safetyPct < 80 ? "#ef4444" : "#22c55e" }}>{safetyPct}%</div>
          </div>
          <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${safetyPct}%`, background: safetyPct < 80 ? "#ef4444" : "#22c55e", borderRadius: 99 }} />
          </div>
          {safetyPct < 100 && <div style={{ marginTop: 10, fontSize: 13, color: "#f59e0b" }}>⚠ {safety.filter(s => !s.done).length} items need attention</div>}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {safety.map(s => (
            <div key={s.id} style={{ ...card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button onClick={() => setSafety(prev => prev.map(x => x.id === s.id ? { ...x, done: !x.done } : x))}
                  style={{ width: 24, height: 24, borderRadius: 99, border: "2px solid",
                    borderColor: s.done ? "#22c55e" : "#475569", background: s.done ? "#22c55e" : "transparent",
                    color: "#fff", cursor: "pointer", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.done ? "✓" : ""}
                </button>
                <span style={{ fontSize: 14, color: s.done ? "#475569" : "#e2e8f0", textDecoration: s.done ? "line-through" : "none" }}>{s.text}</span>
              </div>
              <button onClick={() => setSafety(prev => prev.filter(x => x.id !== s.id))}
                style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <input value={newItem} onChange={e => setNewItem(e.target.value)}
            placeholder="Add safety checklist item…"
            style={{ ...input, flex: 1, margin: 0 }}
            onKeyDown={e => { if (e.key === "Enter" && newItem.trim()) { setSafety(prev => [...prev, { id: Date.now(), text: newItem.trim(), done: false }]); setNewItem(""); } }}
          />
          <button onClick={() => { if (newItem.trim()) { setSafety(prev => [...prev, { id: Date.now(), text: newItem.trim(), done: false }]); setNewItem(""); } }}
            style={btnPrimary}>Add</button>
        </div>
      </div>
    );
  }

  function Modal({ title, children, onClose, onSave }) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{title}</div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
          </div>
          {children}
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ ...btnSm, color: "#94a3b8" }}>Cancel</button>
            <button onClick={onSave} style={btnPrimary}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  const VIEWS = { Dashboard, Projects, "Find Subs": FindSubs, Permits, Subs, Schedule, Budget, Safety };
  const View = VIEWS[tab];

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;800&display=swap" rel="stylesheet" />

      <div style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b", padding: "0 24px",
        display: "flex", alignItems: "center", gap: 20, height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-.02em", color: "#f8fafc" }}>
          🏗 <span style={{ color: "#3b82f6" }}>Build</span>Boss
        </div>
        <div style={{ fontSize: 12, color: "#475569", flex: 1 }}>Owner-Builder Command Center</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: "#22c55e" }} />
          <span style={{ fontSize: 12, color: "#64748b" }}>{proj?.name}</span>
        </div>
      </div>

      <div style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
              background: "transparent", color: tab === t ? "#3b82f6" : "#64748b",
              borderBottom: `2px solid ${tab === t ? "#3b82f6" : "transparent"}`, whiteSpace: "nowrap" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#f8fafc", margin: 0 }}>{tab}</h1>
        </div>
        <View />
      </div>
    </div>
  );
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: "18px 20px",
};

const btnPrimary = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const btnSm = {
  background: "#1e293b",
  color: "#94a3b8",
  border: "none",
  borderRadius: 6,
  padding: "5px 12px",
  cursor: "pointer",
  fontSize: 13,
};

const input = {
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

const lbl = {
  display: "block",
  fontSize: 12,
  color: "#64748b",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  marginBottom: 6,
  marginTop: 12,
};
