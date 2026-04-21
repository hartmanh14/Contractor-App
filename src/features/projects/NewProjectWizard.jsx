import { useState, useRef } from "react";
import { useApp } from "@/store/AppContext";
import { PHASES } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { btnPrimary, btnSm, input, lbl } from "@/styles/theme";

const STEPS = ["Details", "Photos", "Review", "AI Analysis"];

// ---------------------------------------------------------------------------
// Mock AI analysis — replace the body of generateMockAnalysis() with a real
// fetch("/api/analyze", ...) call once you have an Anthropic API key.
// ---------------------------------------------------------------------------

function detectType(description = "", name = "") {
  const text = (description + " " + name).toLowerCase();
  if (/kitchen/.test(text)) return "kitchen";
  if (/bath|shower|tub/.test(text)) return "bathroom";
  if (/deck|patio|porch/.test(text)) return "deck";
  if (/roof/.test(text)) return "roofing";
  if (/basement/.test(text)) return "basement";
  if (/garage/.test(text)) return "garage";
  if (/addition|room/.test(text)) return "addition";
  return "general";
}

const MOCK_DATA = {
  kitchen: {
    regionalCodes: [
      { code: "IRC R303.3", title: "Mechanical Ventilation", description: "Kitchen must have a mechanical exhaust fan rated at 100 CFM minimum, ducted to exterior.", category: "Ventilation" },
      { code: "NEC 210.52(B)", title: "Receptacle Spacing", description: "Counter top receptacles required every 4 ft; no point on counter more than 2 ft from a receptacle.", category: "Electrical" },
      { code: "NEC 210.8(A)(6)", title: "GFCI Protection", description: "All receptacles within 6 ft of a sink must be GFCI protected.", category: "Electrical" },
      { code: "IRC P2722.1", title: "Dishwasher Drain", description: "Dishwasher drain must have a high loop or air gap before connecting to disposal or drain.", category: "Plumbing" },
      { code: "IRC R302.10", title: "Fireblocking", description: "Concealed combustible framing spaces must be firestopped at each floor level.", category: "Fire Safety" },
    ],
    materials: [
      { item: "Cabinets (base)", quantity: "12", unit: "linear ft", estimatedCost: 3600, category: "Millwork" },
      { item: "Cabinets (upper)", quantity: "10", unit: "linear ft", estimatedCost: 2500, category: "Millwork" },
      { item: "Countertop (quartz)", quantity: "35", unit: "sq ft", estimatedCost: 2800, category: "Surfaces" },
      { item: "Tile backsplash", quantity: "25", unit: "sq ft", estimatedCost: 450, category: "Surfaces" },
      { item: "LVP flooring", quantity: "180", unit: "sq ft", estimatedCost: 720, category: "Flooring" },
      { item: "Undermount sink + faucet", quantity: "1", unit: "set", estimatedCost: 550, category: "Plumbing" },
      { item: "Dishwasher rough-in", quantity: "1", unit: "allowance", estimatedCost: 280, category: "Plumbing" },
      { item: "20A circuits (dedicated)", quantity: "3", unit: "each", estimatedCost: 480, category: "Electrical" },
      { item: "Recessed lighting", quantity: "8", unit: "each", estimatedCost: 640, category: "Electrical" },
      { item: "Range hood / exhaust", quantity: "1", unit: "each", estimatedCost: 320, category: "Ventilation" },
      { item: "Drywall + mud", quantity: "12", unit: "sheets", estimatedCost: 240, category: "Framing" },
      { item: "Paint (walls + trim)", quantity: "3", unit: "gallons", estimatedCost: 120, category: "Finishes" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Demo & Haul-Off", low: 800, high: 1400 },
        { category: "Plumbing", low: 1800, high: 3200 },
        { category: "Electrical", low: 2200, high: 3800 },
        { category: "Cabinets & Hardware", low: 6000, high: 14000 },
        { category: "Countertops", low: 2000, high: 6000 },
        { category: "Flooring", low: 1200, high: 3000 },
        { category: "Tile & Backsplash", low: 800, high: 2000 },
        { category: "Paint & Drywall", low: 600, high: 1400 },
        { category: "Fixtures & Appliances", low: 3000, high: 8000 },
        { category: "Permits & Inspections", low: 400, high: 900 },
      ],
      totalLow: 18800,
      totalHigh: 43700,
      notes: "Range reflects builder-grade vs. mid-range finishes. Labor estimated at regional average for Midwest. Structural changes or appliance upgrades will push toward high end.",
    },
    designOptions: [
      {
        title: "Modern Minimalist",
        style: "Contemporary",
        description: "Flat-front cabinetry in matte white with integrated pulls, waterfall quartz island, and under-cabinet LED lighting. Clean sightlines with hidden storage.",
        highlights: ["Handleless flat-front cabinets", "Waterfall quartz island", "Under-cabinet LED strip lighting"],
        estimatedCostAdder: 4500,
        imageUrl: null,
      },
      {
        title: "Transitional Classic",
        style: "Transitional",
        description: "Shaker cabinets in warm greige with brushed nickel hardware, subway tile backsplash, and butcher block accents. Balances modern function with timeless appeal.",
        highlights: ["Shaker-style cabinetry", "Classic subway tile backsplash", "Butcher block accent shelf"],
        estimatedCostAdder: 0,
        imageUrl: null,
      },
      {
        title: "Bold Industrial",
        style: "Industrial",
        description: "Two-tone cabinetry — charcoal lowers, open upper shelving — with concrete-look countertops, matte black fixtures, and exposed Edison pendant lighting.",
        highlights: ["Two-tone charcoal + open shelving", "Concrete-look countertops", "Matte black fixtures & pendants"],
        estimatedCostAdder: 2200,
        imageUrl: null,
      },
    ],
  },
  bathroom: {
    regionalCodes: [
      { code: "IRC R303.3", title: "Bathroom Ventilation", description: "Bathrooms without operable windows require a mechanical exhaust fan rated at 50 CFM minimum.", category: "Ventilation" },
      { code: "NEC 210.8(A)(1)", title: "GFCI Required", description: "All 125V receptacles within bathrooms must be GFCI protected regardless of distance from water.", category: "Electrical" },
      { code: "IRC P2708.1", title: "Shower Pan Liner", description: "Shower receptors must have a liner or waterproof base. Liner must extend 2 in. above threshold.", category: "Waterproofing" },
      { code: "IRC R308.4", title: "Safety Glazing", description: "Glass in shower enclosures and within 24 in. of a door must be safety-glazed.", category: "Safety" },
      { code: "ADA A117.1", title: "Accessible Clearances", description: "Recommended 60-in. turning radius; grab bar blocking in walls recommended even if not currently required.", category: "Accessibility" },
    ],
    materials: [
      { item: "Tile (floor)", quantity: "50", unit: "sq ft", estimatedCost: 450, category: "Surfaces" },
      { item: "Tile (shower walls)", quantity: "80", unit: "sq ft", estimatedCost: 720, category: "Surfaces" },
      { item: "Shower pan / liner", quantity: "1", unit: "set", estimatedCost: 280, category: "Waterproofing" },
      { item: "Vanity + top", quantity: "1", unit: "each", estimatedCost: 900, category: "Millwork" },
      { item: "Toilet", quantity: "1", unit: "each", estimatedCost: 350, category: "Plumbing" },
      { item: "Faucet + drain", quantity: "1", unit: "set", estimatedCost: 280, category: "Plumbing" },
      { item: "Shower door / enclosure", quantity: "1", unit: "each", estimatedCost: 650, category: "Glass" },
      { item: "Exhaust fan", quantity: "1", unit: "each", estimatedCost: 120, category: "Electrical" },
      { item: "GFCI receptacle", quantity: "2", unit: "each", estimatedCost: 80, category: "Electrical" },
      { item: "Cement board", quantity: "10", unit: "sheets", estimatedCost: 200, category: "Substrate" },
      { item: "Waterproofing membrane", quantity: "1", unit: "kit", estimatedCost: 160, category: "Waterproofing" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Demo", low: 500, high: 1000 },
        { category: "Plumbing", low: 1500, high: 2800 },
        { category: "Electrical", low: 600, high: 1200 },
        { category: "Tile & Waterproofing", low: 2000, high: 4500 },
        { category: "Vanity & Fixtures", low: 1200, high: 3500 },
        { category: "Shower Enclosure", low: 600, high: 2000 },
        { category: "Permits", low: 200, high: 500 },
      ],
      totalLow: 6600,
      totalHigh: 15500,
      notes: "Full gut remodel assumed. Keeping existing drain locations reduces plumbing cost significantly.",
    },
    designOptions: [
      {
        title: "Spa Retreat",
        style: "Luxury Modern",
        description: "Large-format porcelain tile with curbless walk-in shower, freestanding soaker tub, and warm wood floating vanity. Rain head + handheld shower system.",
        highlights: ["Curbless walk-in shower", "Freestanding soaker tub", "Rain head + handheld combo"],
        estimatedCostAdder: 5000,
        imageUrl: null,
      },
      {
        title: "Clean & Functional",
        style: "Transitional",
        description: "Subway tile with dark grout, pedestal or undermount sink, frameless pivot shower door. Timeless look that maximizes usable floor space.",
        highlights: ["Subway tile with dark grout", "Frameless pivot door", "Maximized floor space"],
        estimatedCostAdder: 0,
        imageUrl: null,
      },
      {
        title: "Coastal Fresh",
        style: "Coastal",
        description: "White shiplap accent wall, hex floor tile, navy vanity with brushed gold fixtures. Natural light emphasis with frosted glass window.",
        highlights: ["Shiplap accent wall", "Hex mosaic floor tile", "Navy vanity + brushed gold"],
        estimatedCostAdder: 1800,
        imageUrl: null,
      },
    ],
  },
  deck: {
    regionalCodes: [
      { code: "IRC R507.2", title: "Ledger Attachment", description: "Deck ledger must be attached to band joist of structure with approved fasteners; flashing required to prevent water intrusion.", category: "Structural" },
      { code: "IRC R507.3", title: "Footing Size & Depth", description: "Footings must extend below frost depth (varies by region). Minimum 12-in. diameter for most residential decks.", category: "Foundation" },
      { code: "IRC R507.9.2", title: "Guardrail Height", description: "Guardrails required where deck is 30 in. or more above grade. Minimum 36 in. high; balusters max 4 in. apart.", category: "Safety" },
      { code: "IRC R311.7.1", title: "Stair Handrails", description: "Stairs with 4 or more risers require a graspable handrail on at least one side.", category: "Safety" },
      { code: "IRC R507.1", title: "Permit Required", description: "Decks attached to the house or over 200 sq ft typically require a building permit and inspections.", category: "Permit" },
    ],
    materials: [
      { item: "Decking boards (composite)", quantity: "400", unit: "sq ft", estimatedCost: 3200, category: "Decking" },
      { item: "Pressure-treated framing (2x10)", quantity: "24", unit: "each", estimatedCost: 720, category: "Framing" },
      { item: "Concrete footings / Bigfoot forms", quantity: "6", unit: "each", estimatedCost: 480, category: "Foundation" },
      { item: "Post bases (galvanized)", quantity: "6", unit: "each", estimatedCost: 180, category: "Hardware" },
      { item: "Joist hangers + hardware", quantity: "1", unit: "box", estimatedCost: 120, category: "Hardware" },
      { item: "Ledger board (PT 2x12)", quantity: "16", unit: "linear ft", estimatedCost: 160, category: "Framing" },
      { item: "Ledger flashing (aluminum)", quantity: "20", unit: "linear ft", estimatedCost: 80, category: "Waterproofing" },
      { item: "Railing system (cable or composite)", quantity: "40", unit: "linear ft", estimatedCost: 1600, category: "Railing" },
      { item: "Stair stringers + treads", quantity: "1", unit: "set", estimatedCost: 350, category: "Stairs" },
      { item: "Hidden fasteners", quantity: "2", unit: "boxes", estimatedCost: 120, category: "Fasteners" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Footings & Foundation", low: 800, high: 1800 },
        { category: "Framing (PT lumber)", low: 1200, high: 2200 },
        { category: "Decking Material", low: 2400, high: 5500 },
        { category: "Railing System", low: 1200, high: 3500 },
        { category: "Stairs", low: 400, high: 1000 },
        { category: "Labor", low: 2500, high: 5000 },
        { category: "Permits & Inspections", low: 200, high: 600 },
      ],
      totalLow: 8700,
      totalHigh: 19600,
      notes: "Composite decking is mid-range estimate. Pressure-treated wood reduces material cost 30–40%. Railing style is the biggest variable.",
    },
    designOptions: [
      {
        title: "Multi-Level Entertainer",
        style: "Modern Outdoor",
        description: "Two-tier deck with upper dining area and lower lounge zone. Cable railing for unobstructed views, built-in bench seating, and pergola over upper level.",
        highlights: ["Two-tier layout", "Cable railing system", "Built-in benches + pergola"],
        estimatedCostAdder: 6000,
        imageUrl: null,
      },
      {
        title: "Clean Single Level",
        style: "Contemporary",
        description: "Single-level composite deck with horizontal board railing, integrated planter boxes at corners, and pre-wired for string lights along perimeter.",
        highlights: ["Horizontal board railing", "Integrated planters", "Pre-wired lighting"],
        estimatedCostAdder: 0,
        imageUrl: null,
      },
      {
        title: "Natural Retreat",
        style: "Rustic/Natural",
        description: "Pressure-treated framing with Ipe or cedar decking, black powder-coat metal railing, and a shade sail overhead. Low-maintenance with organic feel.",
        highlights: ["Ipe or cedar decking", "Black metal railing", "Shade sail canopy"],
        estimatedCostAdder: 2500,
        imageUrl: null,
      },
    ],
  },
  general: {
    regionalCodes: [
      { code: "IBC 105.1", title: "Permit Required", description: "Building permits are required for any structural work, additions, or significant renovations. Verify thresholds with local AHJ.", category: "Administrative" },
      { code: "IRC R302.1", title: "Fire Separation", description: "Walls and projections must maintain required fire-resistance ratings from property lines. Verify setbacks before framing.", category: "Fire Safety" },
      { code: "NEC 210.12", title: "Arc-Fault Protection", description: "AFCI breakers required on all 120V 15A and 20A circuits in living spaces in most jurisdictions.", category: "Electrical" },
      { code: "IRC N1101", title: "Energy Code Compliance", description: "Insulation R-values, window U-factors, and air sealing must meet current IECC requirements for your climate zone.", category: "Energy" },
      { code: "IRC R403.1.6", title: "Foundation Anchoring", description: "Sill plates must be anchored to foundation per prescriptive or engineered requirements.", category: "Structural" },
    ],
    materials: [
      { item: "Framing lumber (2x6)", quantity: "40", unit: "each", estimatedCost: 560, category: "Framing" },
      { item: "Drywall (1/2 in.)", quantity: "30", unit: "sheets", estimatedCost: 600, category: "Drywall" },
      { item: "Insulation (R-15 batts)", quantity: "500", unit: "sq ft", estimatedCost: 400, category: "Insulation" },
      { item: "Fasteners & hardware", quantity: "1", unit: "allowance", estimatedCost: 250, category: "Hardware" },
      { item: "Paint (walls)", quantity: "5", unit: "gallons", estimatedCost: 200, category: "Finishes" },
      { item: "LVP flooring", quantity: "300", unit: "sq ft", estimatedCost: 1200, category: "Flooring" },
      { item: "Electrical rough-in materials", quantity: "1", unit: "allowance", estimatedCost: 800, category: "Electrical" },
      { item: "Plumbing rough-in materials", quantity: "1", unit: "allowance", estimatedCost: 600, category: "Plumbing" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Demo & Prep", low: 500, high: 2000 },
        { category: "Framing", low: 2000, high: 5000 },
        { category: "Mechanical (Plumbing/Electrical/HVAC)", low: 3000, high: 8000 },
        { category: "Insulation & Drywall", low: 1500, high: 3500 },
        { category: "Flooring & Finishes", low: 2000, high: 6000 },
        { category: "Permits & Fees", low: 300, high: 800 },
      ],
      totalLow: 9300,
      totalHigh: 25300,
      notes: "Estimates are general-purpose ranges. A detailed scope of work will significantly tighten these numbers.",
    },
    designOptions: [
      {
        title: "Modern Clean",
        style: "Contemporary",
        description: "Neutral palette with clean lines, recessed lighting, and streamlined built-ins. Emphasis on open flow and natural light.",
        highlights: ["Open floor plan", "Recessed lighting throughout", "Integrated storage"],
        estimatedCostAdder: 3000,
        imageUrl: null,
      },
      {
        title: "Classic Traditional",
        style: "Traditional",
        description: "Crown molding, panel doors, and warm tones. Timeless finishes that hold long-term value.",
        highlights: ["Crown molding + wainscoting", "Panel doors", "Warm neutral palette"],
        estimatedCostAdder: 0,
        imageUrl: null,
      },
      {
        title: "Farmhouse Inspired",
        style: "Farmhouse",
        description: "Shiplap accents, black window trim, and mixed textures. Relaxed character with modern function.",
        highlights: ["Shiplap accent walls", "Black hardware + trim", "Mixed wood textures"],
        estimatedCostAdder: 1500,
        imageUrl: null,
      },
    ],
  },
};

async function generateMockAnalysis({ name, description }) {
  await new Promise(r => setTimeout(r, 2200));
  const type = detectType(description, name);
  return MOCK_DATA[type] ?? MOCK_DATA.general;
}

// ---------------------------------------------------------------------------

const s = {
  section: { marginBottom: 24 },
  sectionHead: {
    fontSize: 12, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10,
    display: "flex", alignItems: "center", gap: 6,
  },
  card: {
    background: "#0a0f1e", border: "1px solid #1e293b",
    borderRadius: 10, padding: "12px 14px", marginBottom: 8,
  },
  tag: {
    display: "inline-block", padding: "2px 8px", borderRadius: 99,
    fontSize: 11, fontWeight: 700, background: "#1e293b", color: "#94a3b8",
    marginRight: 6, marginBottom: 4,
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13,
  },
};

export default function NewProjectWizard({ onClose }) {
  const { setProjects, setActiveProject } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", address: "", description: "", budget: "",
    startDate: "", endDate: "", phase: "Planning", notes: "", photos: [],
  });
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);
  const fileRef = useRef();

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function addPhotos(files) {
    const added = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(f),
        file: f,
        name: f.name,
        size: f.size,
        caption: "",
      }));
    setForm(f => ({ ...f, photos: [...f.photos, ...added] }));
  }

  function removePhoto(id) { setForm(f => ({ ...f, photos: f.photos.filter(p => p.id !== id) })); }
  function setCaption(id, caption) { setForm(f => ({ ...f, photos: f.photos.map(p => p.id === id ? { ...p, caption } : p) })); }

  const canAdvance = step !== 1 || (form.name.trim() && form.address.trim() && form.budget);

  async function runAnalysis() {
    setStep(4);
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalysis(null);
    try {
      const result = await generateMockAnalysis(form);
      setAnalysis(result);
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

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
      aiAnalysis: analysis || null,
    };
    setProjects(prev => [...prev, project]);
    setActiveProject(project.id);
    onClose();
  }

  const isStep4 = step === 4;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000099", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18,
        width: "100%", maxWidth: isStep4 ? 760 : 560,
        maxHeight: "92vh", overflowY: "auto", padding: 32,
        transition: "max-width .3s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>Start New Project</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Step {step} of {STEPS.length} — {STEPS[step - 1]}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: i < step ? "#3b82f6" : "#1e293b", transition: "background .3s",
            }} />
          ))}
        </div>

        {/* Step 1 — Details */}
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

        {/* Step 2 — Photos */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 16, fontSize: 14, color: "#94a3b8" }}>
              Upload before photos or problem areas — AI will use these to refine its analysis.
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragOver ? "#3b82f6" : "#334155"}`, borderRadius: 12,
                padding: "32px 20px", textAlign: "center", cursor: "pointer",
                background: dragOver ? "#3b82f611" : "#0a0f1e", transition: "all .2s", marginBottom: 16,
              }}>
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
                      style={{
                        position: "absolute", top: 6, right: 6, width: 22, height: 22,
                        borderRadius: 99, background: "#00000088", border: "none",
                        color: "#fff", cursor: "pointer", fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>×</button>
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

        {/* Step 3 — Review */}
        {step === 3 && (
          <div>
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{form.name}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>📍 {form.address}</div>
              {form.description && (
                <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12, lineHeight: 1.6 }}>{form.description}</div>
              )}
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

            <div style={{ padding: "14px 16px", background: "#3b82f611", border: "1px solid #3b82f633", borderRadius: 10, fontSize: 13, color: "#93c5fd" }}>
              🧠 Click <strong>Analyze Project</strong> to generate regional codes, materials list, cost estimate, and 3 design options.
            </div>
          </div>
        )}

        {/* Step 4 — AI Analysis */}
        {step === 4 && (
          <div>
            {analyzing && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", margin: "0 auto 20px",
                  border: "3px solid #1e293b", borderTop: "3px solid #3b82f6",
                  animation: "spin 0.8s linear infinite",
                }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
                  Analyzing your project…
                </div>
                <div style={{ fontSize: 13, color: "#64748b", maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
                  Checking regional codes · Building materials list · Estimating costs · Generating design options
                </div>
              </div>
            )}

            {analyzeError && !analyzing && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <div style={{ color: "#ef4444", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Analysis Failed</div>
                <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{analyzeError}</div>
                <button onClick={runAnalysis} style={btnPrimary}>Retry</button>
              </div>
            )}

            {analysis && !analyzing && (
              <div>
                {/* Regional Codes */}
                <div style={s.section}>
                  <div style={s.sectionHead}>📋 Regional Code Requirements</div>
                  {analysis.regionalCodes.map((code, i) => (
                    <div key={i} style={s.card}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ ...s.tag, background: "#1e3a5f", color: "#93c5fd", flexShrink: 0 }}>
                          {code.code}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>{code.title}</div>
                          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{code.description}</div>
                        </div>
                        <div style={{ ...s.tag, flexShrink: 0 }}>{code.category}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Materials */}
                <div style={s.section}>
                  <div style={s.sectionHead}>🧱 Materials Needed</div>
                  <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ ...s.tableRow, background: "#1e293b", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                      <span>Item</span><span>Qty</span><span>Unit</span><span>Est. Cost</span>
                    </div>
                    {analysis.materials.map((mat, i) => (
                      <div key={i} style={{
                        ...s.tableRow,
                        background: i % 2 === 0 ? "transparent" : "#0f172a",
                        borderTop: "1px solid #1e293b",
                      }}>
                        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{mat.item}</span>
                        <span style={{ color: "#94a3b8" }}>{mat.quantity}</span>
                        <span style={{ color: "#64748b" }}>{mat.unit}</span>
                        <span style={{ color: "#22c55e", fontWeight: 700 }}>{fmt(mat.estimatedCost)}</span>
                      </div>
                    ))}
                    <div style={{
                      ...s.tableRow,
                      background: "#1e293b", borderTop: "1px solid #334155", fontWeight: 700,
                    }}>
                      <span style={{ color: "#94a3b8", gridColumn: "1 / 4" }}>Materials Total</span>
                      <span style={{ color: "#22c55e" }}>
                        {fmt(analysis.materials.reduce((sum, m) => sum + (m.estimatedCost || 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cost Estimate */}
                <div style={s.section}>
                  <div style={s.sectionHead}>💰 Cost Estimate</div>
                  <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, padding: "8px 10px",
                      background: "#1e293b", color: "#64748b", fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: ".06em",
                    }}>
                      <span>Category</span><span>Low</span><span>High</span>
                    </div>
                    {analysis.costEstimate.breakdown.map((row, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
                        gap: 8, padding: "8px 10px", fontSize: 13,
                        background: i % 2 === 0 ? "transparent" : "#0f172a",
                        borderTop: "1px solid #1e293b",
                      }}>
                        <span style={{ color: "#e2e8f0" }}>{row.category}</span>
                        <span style={{ color: "#94a3b8" }}>{fmt(row.low)}</span>
                        <span style={{ color: "#94a3b8" }}>{fmt(row.high)}</span>
                      </div>
                    ))}
                    <div style={{
                      display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
                      gap: 8, padding: "10px", fontWeight: 800,
                      background: "#1e293b", borderTop: "1px solid #334155", fontSize: 14,
                    }}>
                      <span style={{ color: "#f8fafc" }}>Total Range</span>
                      <span style={{ color: "#22c55e" }}>{fmt(analysis.costEstimate.totalLow)}</span>
                      <span style={{ color: "#f59e0b" }}>{fmt(analysis.costEstimate.totalHigh)}</span>
                    </div>
                  </div>
                  {analysis.costEstimate.notes && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", fontStyle: "italic", padding: "0 4px" }}>
                      {analysis.costEstimate.notes}
                    </div>
                  )}
                </div>

                {/* Design Options */}
                <div style={s.section}>
                  <div style={s.sectionHead}>🎨 Design Options</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {analysis.designOptions.map((opt, i) => (
                      <div key={i} style={{
                        background: "#0a0f1e", border: "1px solid #1e293b",
                        borderRadius: 12, overflow: "hidden",
                      }}>
                        <div style={{
                          width: "100%", height: 140, background: ["#1e3a5f", "#1a2e1a", "#2d1e3a"][i],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 36,
                        }}>
                          {["🏠", "🏡", "🏗"][i]}
                        </div>
                        <div style={{ padding: "12px" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{opt.title}</div>
                          <div style={{ ...s.tag, marginBottom: 8 }}>{opt.style}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, marginBottom: 8 }}>{opt.description}</div>
                          {opt.highlights.map((h, j) => (
                            <div key={j} style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>• {h}</div>
                          ))}
                          {opt.estimatedCostAdder !== 0 && (
                            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: opt.estimatedCostAdder > 0 ? "#f59e0b" : "#22c55e" }}>
                              {opt.estimatedCostAdder > 0 ? "+" : ""}{fmt(opt.estimatedCostAdder)} vs. base
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "14px 16px", background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: 10, fontSize: 13, color: "#86efac" }}>
                  ✓ Analysis complete. Click <strong>Create Project</strong> to save everything to your dashboard.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "space-between" }}>
          <button
            onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            disabled={analyzing}
            style={{ ...btnSm, color: "#94a3b8", opacity: analyzing ? 0.4 : 1 }}>
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < 3 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance}
              style={{ ...btnPrimary, opacity: canAdvance ? 1 : 0.4 }}>
              Next →
            </button>
          )}

          {step === 3 && (
            <button onClick={runAnalysis} style={btnPrimary}>
              Analyze Project →
            </button>
          )}

          {step === 4 && !analyzing && (
            <button onClick={analysis ? save : runAnalysis} style={btnPrimary}>
              {analysis ? "✓ Create Project" : "Retry"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
