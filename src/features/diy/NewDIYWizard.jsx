import { useState, useRef } from "react";
import { useApp } from "@/store/AppContext";
import { btnPrimary, btnSm, input, lbl } from "@/styles/theme";
import { fmt } from "@/lib/utils";

const STEPS = ["Details", "Photos", "Review", "AI Plan"];
const ROOMS = ["Living Room", "Kitchen", "Bathroom", "Bedroom", "Home Office", "Garage", "Outdoor/Yard", "Basement", "Other"];

const MOCK_ANALYSES = {
  paint: {
    difficulty: "beginner", difficultyReason: "No special skills needed — patience and prep are all it takes.",
    totalTimeHours: 6, timeBreakdown: "2.5 hrs active + 3.5 hrs drying",
    estimatedTotalCost: 145,
    materials: [
      { item: "Interior latex paint (eggshell)", qty: "2", unit: "gal", cost: 70, store: "Paint dept", notes: "Eggshell cleans better than flat" },
      { item: "Painter's tape", qty: "3", unit: "rolls", cost: 12, store: "Painting supplies" },
      { item: "Plastic drop cloth", qty: "2", unit: "each", cost: 8, store: "Painting supplies" },
      { item: "9-in roller cover (3/8 nap)", qty: "3", unit: "each", cost: 12, store: "Painting supplies" },
      { item: "Paint tray + liner", qty: "1", unit: "set", cost: 6, store: "Painting supplies" },
      { item: "Angled sash brush (2.5 in)", qty: "1", unit: "each", cost: 12, store: "Painting supplies" },
      { item: "Sandpaper (120-grit)", qty: "1", unit: "pack", cost: 5, store: "Abrasives" },
      { item: "Spackling compound", qty: "1", unit: "tub", cost: 8, store: "Drywall & repair" },
      { item: "Interior primer", qty: "1", unit: "qt", cost: 12, store: "Paint dept", notes: "Only for dark-to-light color change" },
    ],
    tools: [
      { item: "9-in roller frame + extension pole", action: "buy", cost: 20 },
      { item: "Putty knife (3-in)", action: "buy", cost: 5 },
      { item: "Stepladder", action: "have", cost: 0 },
    ],
    steps: [
      { number: 1, title: "Clear and protect the room", timeMinutes: 30, description: "Move furniture to center and cover with drop cloths. Remove outlet covers and switch plates. Lay cloths along all walls.", tips: "Photograph outlets before removing covers for easy reinstall.", warning: null },
      { number: 2, title: "Clean walls and patch holes", timeMinutes: 30, description: "Wipe walls with a damp sponge to remove dust and grease. Fill nail holes with spackling and let dry 30–60 min.", tips: "Hold a work light at a low angle to reveal every imperfection.", warning: null },
      { number: 3, title: "Sand, prime, and tape edges", timeMinutes: 60, description: "Sand patches flush, wipe dust, and prime if needed. Apply painter's tape to all trim, baseboards, and ceiling lines; press firmly with the putty knife.", tips: "Remove tape at 45° while the final coat is still slightly wet for the cleanest edge.", warning: null },
      { number: 4, title: "Cut in with brush", timeMinutes: 45, description: "Paint a 2–3 inch band along every taped edge and corner using the angled brush. Work one wall at a time with long, feathered strokes.", tips: "Cut in and roll the same wall while the cut-in is still wet so the textures blend invisibly.", warning: null },
      { number: 5, title: "Roll first coat", timeMinutes: 60, description: "Apply paint in a W pattern then fill in. Work top to bottom in 3-ft sections. Let dry 2+ hours.", tips: "Don't press hard on the roller — let the weight of the tool do the work.", warning: null },
      { number: 6, title: "Second coat and cleanup", timeMinutes: 75, description: "Apply second coat perpendicular to the first. Remove tape while still slightly wet. Clean tools with warm water.", tips: "Press plastic wrap on leftover paint before sealing the can to keep it fresh for touch-ups.", warning: null },
    ],
    tips: ["Buy 10% more paint than calculated", "Test a swatch in daylight AND lamp light before buying the full amount", "Don't shake the can — roll it gently to mix"],
    safetyNotes: ["Open windows and run a fan even with low-VOC paint", "Don't stand on the top two rungs of a stepladder"],
    imagePrompt: "Photorealistic interior rendering of a freshly painted room with smooth warm greige walls, natural light, white trim, modern neutral furnishings, bright and inviting atmosphere",
    imageUrl: null,
  },
  shelf: {
    difficulty: "beginner", difficultyReason: "Requires a drill but no advanced skills — careful measuring is the key.",
    totalTimeHours: 3, timeBreakdown: "2.5 hrs active work",
    estimatedTotalCost: 82,
    materials: [
      { item: "Floating shelf brackets (pair)", qty: "3", unit: "pair", cost: 30, store: "Hardware", notes: "Get brackets rated 50+ lbs per pair" },
      { item: "Shelving boards (1×8, 48 in)", qty: "3", unit: "board", cost: 24, store: "Lumber" },
      { item: "Heavy-duty drywall anchors", qty: "1", unit: "pack", cost: 8, store: "Fasteners", notes: "Only needed if you can't hit studs" },
      { item: "Wood screws (2.5 in)", qty: "1", unit: "box", cost: 7, store: "Fasteners" },
      { item: "Wood filler + touch-up paint", qty: "1", unit: "each", cost: 13, store: "Paint dept" },
    ],
    tools: [
      { item: "Cordless drill/driver", action: "have", cost: 0 },
      { item: "Stud finder", action: "buy", cost: 15, notes: "Essential — don't skip this" },
      { item: "24-in level", action: "buy", cost: 12 },
      { item: "Tape measure + pencil", action: "have", cost: 0 },
    ],
    steps: [
      { number: 1, title: "Plan shelf heights and spacing", timeMinutes: 15, description: "Mark desired shelf heights on the wall with pencil. A 12–16 inch vertical spacing works for most uses. Hold a board against the wall and step back to visualize before committing.", tips: "Photograph your pencil marks for reference during install.", warning: null },
      { number: 2, title: "Locate and mark studs", timeMinutes: 15, description: "Run stud finder at each shelf height and mark centers. Studs are typically 16 in apart. Aim for at least one stud per bracket.", tips: "Shift the shelf position slightly if needed to hit a stud — worth it for long-term strength.", warning: "Never mount shelves for heavy items using only drywall anchors without hitting a stud." },
      { number: 3, title: "Mark and drill pilot holes", timeMinutes: 20, description: "Hold each bracket in position, confirm level with the 24-in level, and mark screw holes precisely. Drill 1/8-in pilot holes. Install anchors in any drywall-only spots.", tips: "Tape on your drill bit at the target depth prevents drilling too deep.", warning: "Check for electrical wires and pipes inside the wall before drilling." },
      { number: 4, title: "Mount brackets and hang shelves", timeMinutes: 40, description: "Drive screws into studs or anchors and confirm each bracket is flush and level. Set shelf boards on brackets, drill small pilot holes up through the bracket tabs into the board, and secure with screws.", tips: "A thin bead of construction adhesive on the bracket before setting the board adds strength and hides the fasteners.", warning: null },
      { number: 5, title: "Fill, finish, and style", timeMinutes: 20, description: "Fill visible screw holes with wood filler, let dry, touch up with paint or stain. Load shelves to test stability. Style in groups of odd numbers with varying heights.", tips: "A small felt pad under the back edge of the board fixes any slight wobble.", warning: null },
    ],
    tips: ["Hit a stud with at least one bracket per shelf — worth shifting the position slightly", "Pre-drill pilot holes slightly smaller than your screw diameter to prevent splitting", "A 4-ft level shows misalignment across all three shelves at once"],
    safetyNotes: ["Wear safety glasses when drilling overhead", "Check for wires and pipes before drilling with an AC-detecting stud finder"],
    imagePrompt: "Photorealistic interior photography of three elegant floating wooden shelves on a white wall in a modern home office, neatly organized with books, small plants, and decor, warm wood tones, clean minimalist professional styling",
    imageUrl: null,
  },
  faucet: {
    difficulty: "intermediate", difficultyReason: "Requires shutting off water supply and basic plumbing connections — manageable but needs care.",
    totalTimeHours: 2, timeBreakdown: "1.5 hrs active work",
    estimatedTotalCost: 95,
    materials: [
      { item: "Replacement faucet", qty: "1", unit: "each", cost: 65, store: "Plumbing", notes: "Buy a matching hole pattern (single vs. 3-hole) to your existing sink" },
      { item: "Plumber's putty or silicone", qty: "1", unit: "tube", cost: 5, store: "Plumbing" },
      { item: "Teflon tape (plumber's tape)", qty: "1", unit: "roll", cost: 3, store: "Plumbing" },
      { item: "Bucket and old towels", qty: "1", unit: "set", cost: 7, store: "Cleaning" },
      { item: "Penetrating oil (PB Blaster)", qty: "1", unit: "can", cost: 8, store: "Fasteners", notes: "For rusted nuts under the sink" },
      { item: "Flexible supply lines (if not included)", qty: "2", unit: "each", cost: 7, store: "Plumbing", notes: "Braided stainless is more durable than plastic" },
    ],
    tools: [
      { item: "Basin wrench", action: "buy", cost: 20, notes: "Essential for the hard-to-reach nuts under the sink" },
      { item: "Adjustable wrench", action: "have", cost: 0 },
      { item: "Flashlight or headlamp", action: "have", cost: 0 },
      { item: "Bucket", action: "have", cost: 0 },
    ],
    steps: [
      { number: 1, title: "Shut off water supply", timeMinutes: 5, description: "Turn the shut-off valves under the sink clockwise until snug. Turn on the faucet to release pressure and confirm water is off. Place a bucket under the supply lines and P-trap.", tips: "If the shut-off valves are stiff or older than 10 years, turn them gently — don't force them.", warning: "If there are no shut-off valves under the sink, turn off the main house water supply." },
      { number: 2, title: "Disconnect supply lines and drain", timeMinutes: 15, description: "Use the adjustable wrench to disconnect the hot and cold supply lines at the shut-off valves. Let water drain into the bucket. Disconnect the lift rod (drain stopper linkage) if your faucet has one.", tips: "Take a photo of all connections before disconnecting anything.", warning: null },
      { number: 3, title: "Remove old faucet", timeMinutes: 20, description: "Use the basin wrench to loosen the mounting nuts from underneath the sink. Spray penetrating oil on any rusted nuts and wait 5 minutes before trying again. Lift the old faucet out from above.", tips: "Old faucets are often corroded to the sink — wiggle and lift gently rather than prying.", warning: null },
      { number: 4, title: "Clean the sink deck and install new faucet", timeMinutes: 20, description: "Scrub off any old putty or mineral deposits from the sink surface. Apply plumber's putty or silicone under the new faucet base per its instructions. Set the faucet into the holes and hand-tighten the mounting nuts from below.", tips: "Don't over-tighten mounting nuts — snug plus a quarter-turn is enough. Over-tightening cracks the deck plate.", warning: null },
      { number: 5, title: "Connect supply lines and test", timeMinutes: 15, description: "Wrap new supply line threads with Teflon tape (2 wraps, clockwise). Connect hot to hot and cold to cold at the valve and faucet. Tighten with the wrench — snug, not overtight. Slowly open the shut-off valves and check every connection for drips.", tips: "Run the water for 30 seconds then recheck all connections — some drips only appear once the water pressure stabilizes.", warning: "Never turn on full pressure immediately — open valves slowly and inspect as you go." },
    ],
    tips: ["Match the faucet hole pattern to your existing sink before buying", "Buy braided stainless supply lines — they're far more durable than cheap plastic ones", "Keep the old faucet box until the new one is confirmed working — returns are easier with the original packaging"],
    safetyNotes: ["Always shut off the water before disconnecting any supply line", "Don't leave the water off for more than a few hours without notifying household members", "Check under the sink for mold or water damage while you have access — easy to address now"],
    imagePrompt: "Photorealistic close-up photography of a beautifully installed modern brushed nickel kitchen faucet on a white farmhouse sink, clean countertops, bright bathroom or kitchen setting, professional product photography style",
    imageUrl: null,
  },
};

function detectType(name, description) {
  const text = (name + " " + description).toLowerCase();
  if (/paint|repaint|color/.test(text)) return "paint";
  if (/shelf|shelves|shelving/.test(text)) return "shelf";
  if (/faucet|drip|leak|plumbing|fixture/.test(text)) return "faucet";
  return null;
}

async function runDIYAnalysis(form) {
  // Encode photos to base64 for server
  const photos = await Promise.all(
    form.photos.map(async photo => {
      if (!photo.file) return null;
      const base64 = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(photo.file);
      });
      return { base64, mimeType: photo.file.type, caption: photo.caption };
    })
  );

  try {
    const res = await fetch("/api/analyze-diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photos: photos.filter(Boolean) }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Server error");
    return data.analysis;
  } catch {
    await new Promise(r => setTimeout(r, 1800));
    const type = detectType(form.name, form.description);
    if (type && MOCK_ANALYSES[type]) return MOCK_ANALYSES[type];
    // Generic fallback
    return {
      difficulty: "beginner", difficultyReason: "With careful preparation, this is manageable for most homeowners.",
      totalTimeHours: 4, timeBreakdown: "3 hrs active work + 1 hr drying/curing",
      estimatedTotalCost: form.budget ? Math.round(form.budget * 0.7) : 120,
      materials: [
        { item: "Primary materials for the project", qty: "1", unit: "set", cost: form.budget ? Math.round(form.budget * 0.5) : 80, store: "Home improvement store" },
        { item: "Prep supplies (tape, cloths, sandpaper)", qty: "1", unit: "set", cost: 20, store: "Painting/hardware" },
        { item: "Fasteners and adhesives", qty: "1", unit: "set", cost: 15, store: "Hardware" },
      ],
      tools: [
        { item: "Basic hand tools (screwdrivers, hammer)", action: "have", cost: 0 },
        { item: "Project-specific tool", action: "buy", cost: 25 },
      ],
      steps: [
        { number: 1, title: "Gather materials and prep the workspace", timeMinutes: 30, description: "Collect all materials and tools. Clear and protect the work area. Read all product instructions before starting.", tips: "Lay out all tools and materials before starting — interruptions to find missing items cause mistakes.", warning: null },
        { number: 2, title: "Execute the main work", timeMinutes: 90, description: "Follow the project steps carefully, taking time to measure and verify before each action. Work methodically from start to finish.", tips: "Measure twice, cut or drill once. The extra 30 seconds saves an hour of correction.", warning: null },
        { number: 3, title: "Inspect and finish", timeMinutes: 30, description: "Check your work carefully. Address any imperfections while materials are still workable. Allow any curing or drying time required.", tips: "Don't rush drying time — most project failures come from moving too fast.", warning: null },
      ],
      tips: ["Read all product instructions before starting", "Gather all materials before beginning — mid-project trips to the store lead to errors", "Take photos as you go for reference"],
      safetyNotes: ["Wear appropriate PPE for the task (safety glasses, gloves)", "Ventilate the workspace when using adhesives, paints, or solvents"],
      imagePrompt: `Photorealistic interior home improvement result showing a beautifully completed ${form.name} project, professional finish, bright and clean home setting`,
      imageUrl: null,
    };
  }
}

export default function NewDIYWizard({ onClose }) {
  const { setDIYProjects } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", room: ROOMS[0], description: "", budget: "", photos: [] });
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);
  const fileRef = useRef();

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function addPhotos(files) {
    const added = Array.from(files).filter(f => f.type.startsWith("image/")).map(f => ({
      id: Date.now() + Math.random(), url: URL.createObjectURL(f), file: f, name: f.name, size: f.size, caption: "",
    }));
    setForm(f => ({ ...f, photos: [...f.photos, ...added] }));
  }

  function removePhoto(id) { setForm(f => ({ ...f, photos: f.photos.filter(p => p.id !== id) })); }
  function setCaption(id, caption) { setForm(f => ({ ...f, photos: f.photos.map(p => p.id === id ? { ...p, caption } : p) })); }

  const canAdvance = step !== 1 || (form.name.trim() && form.description.trim());

  async function runAnalysis() {
    setStep(4);
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalysis(null);
    try {
      const result = await runDIYAnalysis(form);
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
      room: form.room,
      description: form.description.trim(),
      budget: parseFloat(form.budget) || 0,
      difficulty: analysis?.difficulty || "beginner",
      status: "planning",
      completedSteps: [],
      boughtMaterials: [],
      photos: form.photos,
      aiAnalysis: analysis || null,
    };
    setDIYProjects(prev => [...prev, project]);
    onClose();
  }

  const DIFF_COLORS = { beginner: "#22c55e", intermediate: "#f59e0b", advanced: "#ef4444" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, width: "100%", maxWidth: step === 4 ? 720 : 540, maxHeight: "92vh", overflowY: "auto", padding: 32, transition: "max-width .3s" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#f8fafc" }}>New DIY Project</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Step {step} of {STEPS.length} — {STEPS[step - 1]}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < step ? "#3b82f6" : "#1e293b" }} />
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Project Name *</label>
            <input style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 14, boxSizing: "border-box", marginBottom: 0 }} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Paint bedroom, Fix leaky faucet, Install ceiling fan" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5, marginTop: 0 }}>Room / Area</label>
                <select style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }} value={form.room} onChange={e => setF("room", e.target.value)}>
                  {ROOMS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5, marginTop: 0 }}>Materials Budget</label>
                <input style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }} type="number" value={form.budget} onChange={e => setF("budget", e.target.value)} placeholder="150" />
              </div>
            </div>

            <label style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5, marginTop: 12 }}>Describe the Work *</label>
            <textarea value={form.description} onChange={e => setF("description", e.target.value)}
              placeholder="What's the current state? What do you want to end up with? Any special constraints (rental, old house, small room)?"
              rows={4} style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 14, boxSizing: "border-box", resize: "vertical", lineHeight: 1.5, fontFamily: "inherit" }} />
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 14, fontSize: 13, color: "#94a3b8" }}>
              Upload photos of the current state — AI uses them to give more accurate materials and steps.
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragOver ? "#3b82f6" : "#334155"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "#3b82f611" : "#0a0f1e", marginBottom: 14 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
              <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Drag & drop current state photos</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>or click to browse · optional but improves AI accuracy</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addPhotos(e.target.files)} />
            {form.photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                {form.photos.map(photo => (
                  <div key={photo.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid #1e293b" }}>
                    <img src={photo.url} alt={photo.name} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                    <button onClick={() => removePhoto(photo.id)} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 99, background: "#00000088", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    <div style={{ padding: "4px 6px", background: "#0f172a" }}>
                      <input value={photo.caption} onChange={e => setCaption(photo.id, e.target.value)} placeholder="Caption…" style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 4, color: "#e2e8f0", padding: "3px 6px", fontSize: 10, boxSizing: "border-box" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 3 }}>{form.name}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>📍 {form.room}</div>
              <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>{form.description}</div>
              {form.budget && <div style={{ fontSize: 13, color: "#64748b" }}>Materials budget: <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{fmt(parseFloat(form.budget))}</span></div>}
            </div>
            {form.photos.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {form.photos.map(p => <img key={p.id} src={p.url} alt={p.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #1e293b" }} />)}
              </div>
            )}
            <div style={{ padding: "12px 14px", background: "#3b82f611", border: "1px solid #3b82f633", borderRadius: 8, fontSize: 13, color: "#93c5fd" }}>
              🧠 Click <strong>Generate Plan</strong> to get a step-by-step guide, materials list, time estimate, and AI visualization of the finished result.
            </div>
          </div>
        )}

        {/* Step 4: AI Analysis */}
        {step === 4 && (
          <div>
            {analyzing && (
              <div style={{ textAlign: "center", padding: "56px 0" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", margin: "0 auto 18px", border: "3px solid #1e293b", borderTop: "3px solid #3b82f6", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>Building your DIY plan…</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Generating materials list · Estimating time · Writing step-by-step guide</div>
              </div>
            )}

            {analyzeError && !analyzing && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 16 }}>Analysis failed: {analyzeError}</div>
                <button onClick={runAnalysis} style={btnPrimary}>Retry</button>
              </div>
            )}

            {analysis && !analyzing && (
              <div>
                {/* Summary header */}
                <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 18px", marginBottom: 18 }}>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                    <Stat label="Difficulty" value={analysis.difficulty} color={DIFF_COLORS[analysis.difficulty]} />
                    <Stat label="Total Time" value={`${analysis.totalTimeHours} hrs`} color="#3b82f6" />
                    <Stat label="Est. Cost" value={fmt(analysis.estimatedTotalCost)} color="#22c55e" />
                    <Stat label="Steps" value={`${analysis.steps.length} steps`} color="#a855f7" />
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>{analysis.timeBreakdown}</div>
                </div>

                {/* Materials preview */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Materials ({analysis.materials.length} items)</div>
                  {analysis.materials.slice(0, 5).map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1e293b", fontSize: 13 }}>
                      <span style={{ color: "#e2e8f0" }}>{m.item} <span style={{ color: "#64748b" }}>({m.qty} {m.unit})</span></span>
                      <span style={{ color: "#22c55e" }}>{fmt(m.cost)}</span>
                    </div>
                  ))}
                  {analysis.materials.length > 5 && <div style={{ fontSize: 12, color: "#475569", padding: "6px 0" }}>+ {analysis.materials.length - 5} more items</div>}
                </div>

                {/* Steps preview */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Steps Preview</div>
                  {analysis.steps.map(s => (
                    <div key={s.number} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #1e293b" }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#64748b", fontWeight: 700, flexShrink: 0 }}>{s.number}</span>
                      <span style={{ fontSize: 13, color: "#e2e8f0" }}>{s.title} <span style={{ color: "#475569" }}>({s.timeMinutes} min)</span></span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "12px 14px", background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: 8, fontSize: 13, color: "#86efac" }}>
                  ✓ Plan ready. Click <strong>Save Project</strong> to open your step-by-step guide.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 26, justifyContent: "space-between" }}>
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)} disabled={analyzing} style={{ ...btnSm, color: "#94a3b8", opacity: analyzing ? 0.4 : 1 }}>
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step < 3 && <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance} style={{ ...btnPrimary, opacity: canAdvance ? 1 : 0.4 }}>Next →</button>}
          {step === 3 && <button onClick={runAnalysis} style={btnPrimary}>Generate Plan →</button>}
          {step === 4 && !analyzing && <button onClick={analysis ? save : runAnalysis} style={btnPrimary}>{analysis ? "✓ Save Project" : "Retry"}</button>}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color, marginTop: 2, textTransform: "capitalize" }}>{value}</div>
    </div>
  );
}
