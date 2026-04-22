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
  if (/deck|porch/.test(text)) return "deck";
  if (/roof|shingle|gutter|soffit|fascia/.test(text)) return "roofing";
  if (/siding|cladding|hardie|vinyl siding|fiber cement/.test(text)) return "siding";
  if (/cabinet|cabinetry|built-in|millwork/.test(text)) return "cabinetry";
  if (/electrical|panel upgrade|rewire|circuit/.test(text)) return "electrical";
  if (/plumbing|repipe|water heater|drain line/.test(text)) return "plumbing";
  if (/hvac|furnace|heat pump|mini-split|ductwork/.test(text)) return "hvac";
  if (/hardwood floor|flooring|lvp|laminate floor|tile floor|carpet/.test(text)) return "flooring";
  if (/driveway|concrete|patio slab|foundation/.test(text)) return "concrete";
  if (/addition|room addition|framing|structural|load-bearing/.test(text)) return "framing";
  if (/insulation|spray foam|blown-in|air sealing/.test(text)) return "insulation";
  if (/drywall|sheetrock|plaster repair|ceiling repair/.test(text)) return "drywall";
  if (/window replacement|door replacement|new windows|entry door/.test(text)) return "windowsDoors";
  if (/paint|painting|exterior paint|interior paint/.test(text)) return "painting";
  if (/landscap|lawn|irrigation|hardscape|retaining wall/.test(text)) return "landscaping";
  if (/basement/.test(text)) return "basement";
  if (/garage/.test(text)) return "garage";
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
  roofing: {
    regionalCodes: [
      { code: "IRC R905.2", title: "Asphalt Shingle Application", description: "Shingles must be fastened with minimum 4 nails per strip shingle. Nails must penetrate through decking or 3/4 in. into structural members.", category: "Installation" },
      { code: "IRC R903.2", title: "Flashings Required", description: "Flashings must be installed at roof-to-wall intersections, valleys, skylights, and all penetrations. Metal flashing minimum 0.019-in. corrosion-resistant.", category: "Waterproofing" },
      { code: "IRC R905.2.7", title: "Ice Barrier Required", description: "In areas with average daily temp ≤25°F, ice barrier (self-adhering polymer-modified bitumen) required at eaves extending 24 in. inside exterior wall line.", category: "Climate Protection" },
      { code: "IRC R806.1", title: "Attic Ventilation", description: "Minimum 1/150 net free ventilation area (or 1/300 with upper and lower vents). Balanced ridge-to-soffit system required — do not mix vent types at different levels.", category: "Ventilation" },
      { code: "IRC R905.2.8.2", title: "Drip Edge Required", description: "Corrosion-resistant drip edge required at all eaves and rakes. Install under felt at eaves, over felt at rakes. Minimum 2-in. overhang.", category: "Water Management" },
    ],
    materials: [
      { item: "Architectural shingles (30-yr)", quantity: "28", unit: "squares", estimatedCost: 3640, category: "Roofing" },
      { item: "Synthetic underlayment", quantity: "28", unit: "squares", estimatedCost: 840, category: "Roofing" },
      { item: "Ice & water shield", quantity: "4", unit: "squares", estimatedCost: 480, category: "Waterproofing" },
      { item: "Drip edge (coil stock)", quantity: "180", unit: "linear ft", estimatedCost: 270, category: "Flashing" },
      { item: "Ridge cap shingles", quantity: "1.5", unit: "squares", estimatedCost: 285, category: "Roofing" },
      { item: "Pipe boot flashings", quantity: "4", unit: "each", estimatedCost: 120, category: "Flashing" },
      { item: "Step flashing (aluminum)", quantity: "25", unit: "pcs", estimatedCost: 75, category: "Flashing" },
      { item: "Roofing nails (1-3/4 in.)", quantity: "50", unit: "lbs", estimatedCost: 150, category: "Fasteners" },
      { item: "Starter strip shingles", quantity: "3", unit: "bundles", estimatedCost: 135, category: "Roofing" },
      { item: "Ridge vent (continuous)", quantity: "40", unit: "linear ft", estimatedCost: 200, category: "Ventilation" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Tear-off & Disposal", low: 800, high: 1800 },
        { category: "Decking Repairs (per sheet)", low: 0, high: 1200 },
        { category: "Underlayment & Ice Shield", low: 700, high: 1400 },
        { category: "Shingles & Installation", low: 3500, high: 7500 },
        { category: "Flashings & Penetrations", low: 500, high: 1200 },
        { category: "Ventilation (ridge + soffit)", low: 300, high: 800 },
        { category: "Gutters (if included)", low: 0, high: 2200 },
        { category: "Permits & Inspections", low: 150, high: 400 },
      ],
      totalLow: 5950,
      totalHigh: 16500,
      notes: "Architectural shingles assumed. Metal roofing adds 40–80% to material cost but lasts 40–70 years. Deck replacement is the biggest unknown — budget 10% contingency for hidden rot.",
    },
    designOptions: [
      { title: "Architectural Dimensional", style: "Traditional", description: "30-year architectural shingles in a textured, multi-layer dimensional profile. Algae-resistant granules standard. Best value for performance.", highlights: ["Dimensional profile hides imperfections", "Algae-resistant warranty", "Class A fire rating"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Impact-Resistant Class 4", style: "Premium Asphalt", description: "Class 4 hail-rated shingles with reinforced fiberglass mat. May qualify for insurance premium discount in hail-prone regions.", highlights: ["Class 4 UL 2218 impact rating", "Insurance premium reduction potential", "Enhanced wind resistance"], estimatedCostAdder: 1800, imageUrl: null },
      { title: "Standing Seam Metal", style: "Metal/Modern", description: "Concealed-fastener steel or aluminum standing seam — lifetime expectancy 50+ years, minimal maintenance, excellent snow shedding and fire resistance.", highlights: ["50+ year lifespan", "No exposed fasteners to fail", "Excellent for solar panel mounting"], estimatedCostAdder: 9500, imageUrl: null },
    ],
  },
  siding: {
    regionalCodes: [
      { code: "IRC R703.1", title: "Exterior Wall Covering", description: "Exterior wall coverings must be applied over an approved weather-resistant barrier (WRB/housewrap) that drains to the exterior. Lapped shingle-style, upper over lower.", category: "Waterproofing" },
      { code: "IRC R703.8", title: "Flashing Required", description: "Flashing must be installed at all penetrations, roof-to-wall intersections, and above all openings. Kick-out flashing required where roof meets vertical wall.", category: "Flashing" },
      { code: "IRC R703.11", title: "Fiber Cement Installation", description: "Fiber cement siding must be installed per manufacturer instructions. Minimum 6-in. clearance from grade; all field cuts must be back-primed before installation.", category: "Installation" },
      { code: "IRC R703.3", title: "Vapor Retarder", description: "A vapor retarder or vapor control layer may be required on the interior side of wall framing depending on climate zone. Consult your local code for specific requirements.", category: "Moisture Management" },
      { code: "IECC R402.1", title: "Continuous Insulation", description: "Many climate zones require continuous exterior insulation under siding to meet energy code. Verify R-value requirements for your climate zone before ordering materials.", category: "Energy Code" },
    ],
    materials: [
      { item: "Fiber cement lap siding (7-in. exposure)", quantity: "2100", unit: "sq ft", estimatedCost: 3780, category: "Siding" },
      { item: "Housewrap (WRB)", quantity: "2300", unit: "sq ft", estimatedCost: 690, category: "Waterproofing" },
      { item: "Flashing tape (4-in. self-adhering)", quantity: "3", unit: "rolls", estimatedCost: 165, category: "Waterproofing" },
      { item: "Fiber cement trim boards", quantity: "180", unit: "linear ft", estimatedCost: 720, category: "Trim" },
      { item: "Corner posts (fiber cement)", quantity: "6", unit: "each", estimatedCost: 300, category: "Trim" },
      { item: "J-channel / starter strip", quantity: "100", unit: "linear ft", estimatedCost: 150, category: "Trim" },
      { item: "Stainless steel nails (1-3/4 in.)", quantity: "10", unit: "lbs", estimatedCost: 180, category: "Fasteners" },
      { item: "Paintable caulk (polyurethane)", quantity: "12", unit: "tubes", estimatedCost: 96, category: "Sealant" },
      { item: "Soffit panel (vented)", quantity: "250", unit: "sq ft", estimatedCost: 500, category: "Soffit/Fascia" },
      { item: "Fascia board (fiber cement)", quantity: "90", unit: "linear ft", estimatedCost: 360, category: "Soffit/Fascia" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Demo & Strip Existing", low: 600, high: 1500 },
        { category: "Housewrap & Flashing", low: 700, high: 1400 },
        { category: "Siding Material & Labor", low: 5000, high: 12000 },
        { category: "Trim & Corners", low: 900, high: 2200 },
        { category: "Soffit & Fascia", low: 1200, high: 3000 },
        { category: "Painting (if unprimed)", low: 1500, high: 3500 },
        { category: "Permits", low: 200, high: 500 },
      ],
      totalLow: 10100,
      totalHigh: 24100,
      notes: "Fiber cement assumed. Vinyl siding reduces labor cost 20–30% but has more thermal movement. Premium primed fiber cement (factory finish) eliminates paint cost but increases material 30%.",
    },
    designOptions: [
      { title: "Classic Lap / Hardie Plank", style: "Traditional", description: "7-in. exposure lap siding with smooth or woodgrain texture, primed and ready for any color. Pairs with wide corner posts and trim boards for a traditional farmhouse or colonial look.", highlights: ["Timeless horizontal lap profile", "Paintable to any color", "50-year product warranty"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Board & Batten Vertical", style: "Contemporary Farmhouse", description: "Wide vertical panels with narrow batten strips create a tall, bold, modern farmhouse exterior. Works beautifully in dark charcoal or warm white tones.", highlights: ["Bold vertical lines for curb appeal", "Dark color-through options available", "Low-maintenance fiber cement"], estimatedCostAdder: 2200, imageUrl: null },
      { title: "Mixed Material (Shingle + Lap)", style: "Craftsman", description: "Combines fiber cement shingles in gable ends and dormers with lap siding on main body. Cedar-stagger shingles add texture and character for a craftsman aesthetic.", highlights: ["Shingle details at gables/dormers", "Two-tone color opportunity", "Rich craftsman character"], estimatedCostAdder: 3800, imageUrl: null },
    ],
  },
  cabinetry: {
    regionalCodes: [
      { code: "NEC 210.52(B)", title: "Countertop Receptacle Spacing", description: "In kitchens, no point along a counter wall should be more than 24 in. from a receptacle. Required on all counter surfaces wider than 12 in.", category: "Electrical" },
      { code: "NEC 210.8(A)(6)", title: "GFCI at Countertops", description: "All receptacles within 6 ft of a sink must be GFCI protected. Applies to kitchen, bathroom, and laundry countertops.", category: "Electrical" },
      { code: "ADA A117.1", title: "Accessible Counter Height", description: "ADA-compliant counters are 34 in. max. If designing for accessibility, knee clearance of 27-in. high x 30-in. wide x 19-in. deep required under work surfaces.", category: "Accessibility" },
      { code: "IRC P2722.1", title: "Dishwasher Drain Air Gap", description: "Dishwasher drain must have a high loop at cabinet top or an approved air gap mounted at sink deck to prevent backflow.", category: "Plumbing" },
      { code: "IRC R302.10", title: "Fireblocking at Cabinets", description: "Concealed spaces created by soffit framing above upper cabinets must be firestopped at each floor level with approved materials.", category: "Fire Safety" },
    ],
    materials: [
      { item: "Base cabinets (semi-custom)", quantity: "14", unit: "linear ft", estimatedCost: 5600, category: "Cabinets" },
      { item: "Wall/upper cabinets", quantity: "12", unit: "linear ft", estimatedCost: 3600, category: "Cabinets" },
      { item: "Tall pantry/utility cabinet", quantity: "1", unit: "each", estimatedCost: 900, category: "Cabinets" },
      { item: "Drawer boxes (dovetail)", quantity: "10", unit: "each", estimatedCost: 500, category: "Hardware" },
      { item: "Soft-close hinges (Blum)", quantity: "30", unit: "pair", estimatedCost: 450, category: "Hardware" },
      { item: "Soft-close drawer slides (undermount)", quantity: "10", unit: "pair", estimatedCost: 400, category: "Hardware" },
      { item: "Pulls/knobs", quantity: "30", unit: "each", estimatedCost: 300, category: "Hardware" },
      { item: "Filler strips & scribe molding", quantity: "1", unit: "allowance", estimatedCost: 250, category: "Trim" },
      { item: "Crown molding (cabinet-grade)", quantity: "30", unit: "linear ft", estimatedCost: 360, category: "Trim" },
      { item: "Countertop (quartz, fabricated)", quantity: "42", unit: "sq ft", estimatedCost: 3360, category: "Countertop" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Demo & Prep", low: 400, high: 900 },
        { category: "Base & Upper Cabinets", low: 5000, high: 18000 },
        { category: "Cabinet Installation Labor", low: 1200, high: 2800 },
        { category: "Countertop Fabrication & Install", low: 2500, high: 8000 },
        { category: "Hardware (hinges, slides, pulls)", low: 800, high: 2000 },
        { category: "Crown Molding & Trim", low: 400, high: 1200 },
        { category: "Electrical (outlets, under-cab lighting)", low: 500, high: 1500 },
        { category: "Permits", low: 0, high: 300 },
      ],
      totalLow: 10800,
      totalHigh: 34700,
      notes: "Wide range reflects stock vs. custom cabinetry. Semi-custom (Kraftmaid, Merillat, Aristokraft) is best value. Custom solid wood doubles the cost. Countertop is the most visible upgrade — budget accordingly.",
    },
    designOptions: [
      { title: "Shaker Transitional", style: "Transitional", description: "Five-piece shaker door in painted white or greige with soft-close hardware and quartz countertops. The most resale-friendly choice — timeless and neutral.", highlights: ["5-piece shaker door style", "Soft-close hinges & slides", "Painted finish in any color"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Modern Slab / European", style: "Contemporary", description: "Flat-front frameless full-access cabinets in matte white or dark charcoal with integrated pulls or push-to-open. Maximizes interior cabinet space.", highlights: ["Frameless full-access box", "Integrated or handleless pulls", "10% more interior space"], estimatedCostAdder: 3500, imageUrl: null },
      { title: "Custom Inset", style: "Traditional/Craftsman", description: "Face-frame cabinets with inset doors for a furniture-like flush appearance. Requires precision installation. Often paired with decorative feet, glass uppers, and period hardware.", highlights: ["Flush inset door for furniture look", "Face-frame construction", "Decorative feet & glass uppers"], estimatedCostAdder: 8000, imageUrl: null },
    ],
  },
  electrical: {
    regionalCodes: [
      { code: "NEC 210.12", title: "AFCI Protection Required", description: "Arc-fault circuit interrupter (AFCI) protection required on all 120V 15A and 20A circuits in bedrooms, living rooms, dining, and most interior spaces. Dual-function AFCI/GFCI combo breakers now available.", category: "Protection" },
      { code: "NEC 210.8", title: "GFCI Protection Locations", description: "Ground-fault protection required in all bathrooms, kitchens (within 6 ft of sink), garages, outdoor receptacles, crawlspaces, unfinished basements, and near swimming pools.", category: "Protection" },
      { code: "NEC 230.79", title: "Service Capacity", description: "200A service is standard minimum for most new residential work. Homes with EV chargers, electric heat, or future battery storage should specify 200–400A service with space for expansion.", category: "Service" },
      { code: "NEC 406.12", title: "Tamper-Resistant Receptacles", description: "Tamper-resistant (TR) receptacles required in all new and replacement receptacles in dwelling units. The TR shutters prevent children from inserting foreign objects.", category: "Safety" },
      { code: "IRC R314", title: "Smoke & CO Detectors", description: "Smoke alarms required in each sleeping room, outside each sleeping area, and on each story. CO detectors required within 10 ft of sleeping rooms when gas appliances or attached garage present.", category: "Life Safety" },
    ],
    materials: [
      { item: "Main panel (200A, Square D QO)", quantity: "1", unit: "each", estimatedCost: 1400, category: "Panel" },
      { item: "20A AFCI/GFCI breakers", quantity: "8", unit: "each", estimatedCost: 480, category: "Breakers" },
      { item: "15A AFCI breakers", quantity: "10", unit: "each", estimatedCost: 450, category: "Breakers" },
      { item: "14-2 NM-B wire", quantity: "500", unit: "feet", estimatedCost: 350, category: "Wiring" },
      { item: "12-2 NM-B wire", quantity: "300", unit: "feet", estimatedCost: 270, category: "Wiring" },
      { item: "TR duplex receptacles", quantity: "25", unit: "each", estimatedCost: 125, category: "Devices" },
      { item: "Decora switches (single pole)", quantity: "15", unit: "each", estimatedCost: 75, category: "Devices" },
      { item: "Old-work boxes", quantity: "20", unit: "each", estimatedCost: 60, category: "Boxes" },
      { item: "Weatherproof receptacle covers", quantity: "4", unit: "each", estimatedCost: 40, category: "Devices" },
      { item: "Smoke/CO combo detectors", quantity: "5", unit: "each", estimatedCost: 250, category: "Life Safety" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Panel Replacement / Upgrade", low: 1800, high: 4000 },
        { category: "New Branch Circuits", low: 250, high: 600, },
        { category: "Rough Wiring Labor", low: 1500, high: 4000 },
        { category: "Devices & Trim-Out", low: 800, high: 2000 },
        { category: "AFCI/GFCI Protection", low: 400, high: 1200 },
        { category: "Permit & Inspections", low: 300, high: 700 },
      ],
      totalLow: 5050,
      totalHigh: 12500,
      notes: "Pricing per circuit varies $250–600. Federal Pacific Stab-Lok or Zinsco panels require immediate replacement (fire hazard). EV charger circuit adds $400–900. Whole-home surge protection add $200–400.",
    },
    designOptions: [
      { title: "Standard Functional Upgrade", style: "Code Compliance", description: "200A panel replacement with AFCI/GFCI protection on all required circuits. Tamper-resistant receptacles throughout. All work to current NEC.", highlights: ["200A Square D QO or Eaton CH panel", "AFCI/GFCI on all required circuits", "Tamper-resistant receptacles"], estimatedCostAdder: 0, imageUrl: null },
      { title: "EV-Ready + Smart Home Prep", style: "Future-Ready", description: "200A panel with 50A NEMA 14-50 EV outlet in garage, smart switch pre-wiring in key locations, whole-home surge protection, and generator interlock kit.", highlights: ["50A EV charging outlet in garage", "Smart switch wiring at key locations", "Generator interlock + whole-home surge"], estimatedCostAdder: 2200, imageUrl: null },
      { title: "400A Service + Battery-Ready", style: "Premium/Whole-Home", description: "400A underground or overhead service upgrade with dual 200A panels or a 400A main panel. Pre-wired for solar battery backup. Ideal for all-electric homes or major additions.", highlights: ["400A service for all-electric lifestyle", "Dual panel or large main for expansion", "Solar-battery backup pre-wiring"], estimatedCostAdder: 5500, imageUrl: null },
    ],
  },
  plumbing: {
    regionalCodes: [
      { code: "IPC 305.4", title: "Protection Against Physical Damage", description: "Pipes in framing members must have at least 1-1/2-in. clearance from framing edges, or be protected by steel nail plates, to prevent accidental penetration by drywall screws or nails.", category: "Installation" },
      { code: "IPC 608.1", title: "Backflow Prevention", description: "Potable water must be protected from backflow. Hose bibbs require vacuum breakers; dishwashers require high-loop or air gap; irrigation systems require pressure vacuum breakers or RPZ devices.", category: "Water Quality" },
      { code: "IRC P2903.1", title: "Water Supply Pressure", description: "Water pressure at service must be between 40–80 PSI. A pressure reducing valve (PRV) is required where incoming pressure exceeds 80 PSI to protect supply fittings and water heaters.", category: "Pressure Management" },
      { code: "IRC P3003.7", title: "Slope of DWV Piping", description: "Drain pipes must slope minimum 1/4 in. per foot toward point of disposal. Pipes 3 in. and larger may use 1/8 in. per foot. Proper slope prevents blockage and sewer gas issues.", category: "Drainage" },
      { code: "IRC P2801.6", title: "T&P Relief Valve Drain", description: "Every water heater must have a temperature and pressure relief valve. The discharge pipe must run to within 6 in. of floor or approved drain point — never capped or plugged.", category: "Safety" },
    ],
    materials: [
      { item: "PEX-A tubing (1/2 in.)", quantity: "300", unit: "feet", estimatedCost: 270, category: "Supply" },
      { item: "PEX manifold (12-port)", quantity: "1", unit: "each", estimatedCost: 180, category: "Supply" },
      { item: "PEX expansion fittings", quantity: "20", unit: "each", estimatedCost: 100, category: "Supply" },
      { item: "PRV (pressure reducing valve)", quantity: "1", unit: "each", estimatedCost: 120, category: "Supply" },
      { item: "Expansion tank (2-gal)", quantity: "1", unit: "each", estimatedCost: 80, category: "Supply" },
      { item: "PVC DWV pipe (3 in.)", quantity: "40", unit: "feet", estimatedCost: 140, category: "Drain/Vent" },
      { item: "PVC DWV fittings (elbows, wyes)", quantity: "1", unit: "allowance", estimatedCost: 200, category: "Drain/Vent" },
      { item: "P-traps & drain assemblies", quantity: "4", unit: "each", estimatedCost: 80, category: "Fixtures" },
      { item: "Ball valves (1/2 in.)", quantity: "8", unit: "each", estimatedCost: 120, category: "Valves" },
      { item: "Water heater (50-gal gas)", quantity: "1", unit: "each", estimatedCost: 950, category: "Equipment" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Supply Rough-In (PEX)", low: 1200, high: 2800 },
        { category: "DWV Rough-In", low: 1000, high: 2500 },
        { category: "Water Heater Replacement", low: 900, high: 2200 },
        { category: "Fixture Trim-Out", low: 600, high: 1500 },
        { category: "Shutoffs & Valves", low: 300, high: 700 },
        { category: "Permits & Inspections", low: 200, high: 500 },
      ],
      totalLow: 4200,
      totalHigh: 10200,
      notes: "PEX is the dominant residential supply piping — faster install, freeze-resistant, and corrosion-proof. Full repipe of a 2,000 sq ft home typically runs $4,000–10,000. Slab leaks add $1,500–3,000 for access.",
    },
    designOptions: [
      { title: "PEX Manifold Home-Run", style: "Modern", description: "Each fixture gets a dedicated PEX line from a central manifold with individual shutoffs per fixture. No joints in walls — maximum leak protection and easy future service.", highlights: ["Individual shutoff per fixture", "No joints concealed in walls", "Easy isolation for repairs"], estimatedCostAdder: 600, imageUrl: null },
      { title: "Tankless Water Heater", style: "Efficiency Upgrade", description: "On-demand tankless gas water heater — endless hot water, no standby heat loss, 20-year lifespan. Requires dedicated gas line upgrade and possibly larger flue.", highlights: ["Endless hot water on demand", "25–35% energy savings vs. tank", "Wall-mounted, frees floor space"], estimatedCostAdder: 1200, imageUrl: null },
      { title: "Heat Pump Water Heater", style: "All-Electric/Eco", description: "Electric heat pump water heater uses refrigerant cycle for 3–4x the efficiency of standard electric resistance. Qualifies for 30% federal tax credit. Best for conditioned spaces.", highlights: ["3–4x more efficient than standard electric", "30% federal tax credit (IRA)", "Qualifies for utility rebates"], estimatedCostAdder: 800, imageUrl: null },
    ],
  },
  hvac: {
    regionalCodes: [
      { code: "IRC M1401.3", title: "Equipment Sizing Required", description: "HVAC equipment must be sized based on calculated loads per ACCA Manual J. Oversizing causes short cycling, poor humidity control, and premature failure. Require a Manual J from your contractor.", category: "Sizing" },
      { code: "ASHRAE 62.2", title: "Whole-House Ventilation", description: "Mechanically ventilated homes must meet minimum fresh air rates. Required when home is tightened below 5 ACH50. ERV/HRV or dedicated fresh air intake integrated with air handler.", category: "Ventilation" },
      { code: "IRC M1601.1", title: "Duct Construction", description: "Supply and return ducts in unconditioned spaces must be insulated to minimum R-6 (R-8 in Climate Zones 3+). Duct joints must be sealed with mastic or UL 181 tape — not cloth duct tape.", category: "Ductwork" },
      { code: "IECC C403", title: "Minimum Efficiency", description: "Minimum efficiency standards: gas furnaces ≥80% AFUE (≥90% recommended); central AC ≥14 SEER2; heat pumps ≥15 SEER2. Energy Star certified equipment typically qualifies for utility rebates.", category: "Efficiency" },
      { code: "IRC M1801.1", title: "Combustion Air", description: "Gas equipment requires adequate combustion air. New high-efficiency sealed-combustion furnaces pull outdoor air directly through PVC pipe — preferred for tight homes to prevent back-drafting.", category: "Combustion" },
    ],
    materials: [
      { item: "Gas furnace (96% AFUE, 80K BTU)", quantity: "1", unit: "each", estimatedCost: 1400, category: "Equipment" },
      { item: "Central AC (3-ton, 16 SEER2)", quantity: "1", unit: "each", estimatedCost: 1800, category: "Equipment" },
      { item: "Air handler / coil", quantity: "1", unit: "each", estimatedCost: 700, category: "Equipment" },
      { item: "Lineset (25 ft)", quantity: "1", unit: "set", estimatedCost: 180, category: "Refrigeration" },
      { item: "Sheet metal trunk duct", quantity: "40", unit: "linear ft", estimatedCost: 600, category: "Ductwork" },
      { item: "Flex duct (6 in.)", quantity: "100", unit: "feet", estimatedCost: 200, category: "Ductwork" },
      { item: "Supply registers (6x10)", quantity: "12", unit: "each", estimatedCost: 120, category: "Ductwork" },
      { item: "Return air grille (20x20)", quantity: "3", unit: "each", estimatedCost: 90, category: "Ductwork" },
      { item: "Programmable thermostat (smart)", quantity: "1", unit: "each", estimatedCost: 180, category: "Controls" },
      { item: "PVC condensate line & fittings", quantity: "1", unit: "allowance", estimatedCost: 80, category: "Drainage" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Equipment (furnace + AC or heat pump)", low: 3500, high: 8000 },
        { category: "Installation Labor", low: 1500, high: 3500 },
        { category: "Ductwork (modification/new)", low: 800, high: 4000 },
        { category: "Electrical (disconnect, breaker)", low: 300, high: 700 },
        { category: "Gas Line (if applicable)", low: 0, high: 800 },
        { category: "Permits & Start-Up", low: 200, high: 600 },
      ],
      totalLow: 6300,
      totalHigh: 17600,
      notes: "Heat pump replaces both furnace and AC — higher upfront but qualifies for 30% federal tax credit and utility rebates. Duct sealing (Aeroseal) is $800–1,500 and often reduces HVAC equipment sizing needed.",
    },
    designOptions: [
      { title: "Gas Furnace + Central AC", style: "Traditional Split System", description: "Separate high-efficiency gas furnace (96% AFUE) and central air conditioner (16 SEER2). Most common system in gas-available areas. Fastest heat delivery.", highlights: ["Fastest heating in cold climates", "Lowest upfront cost in gas-available areas", "Reliable, widely serviced technology"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Dual-Fuel Heat Pump", style: "Hybrid Efficiency", description: "Air-source heat pump handles cooling and mild heating. Gas furnace takes over below ~35°F for efficient backup. Best of both worlds — maximum year-round efficiency.", highlights: ["Heat pump efficiency in shoulder seasons", "Gas backup for coldest days", "Lower utility bills vs. either alone"], estimatedCostAdder: 1500, imageUrl: null },
      { title: "Multi-Zone Mini-Split", style: "Ductless/Modern", description: "Ductless mini-split system with one outdoor unit and multiple indoor heads for zoned comfort. No ductwork losses, individual room control, quiet operation. Qualifies for 30% tax credit.", highlights: ["Individual zone control per room", "No duct losses (duct systems lose 20–30%)", "30% federal tax credit eligible"], estimatedCostAdder: 4000, imageUrl: null },
    ],
  },
  flooring: {
    regionalCodes: [
      { code: "IRC R502.1", title: "Subfloor Deflection Limits", description: "Structural subfloor must limit deflection to L/360 for tile and most hard flooring. Bounce in floors before tiling often indicates undersized joists or inadequate blocking.", category: "Structural" },
      { code: "ANSI A108.02", title: "Tile Installation Standards", description: "Tile must be installed on a stable, clean substrate. Minimum 95% mortar coverage required on back of tile. Large format tile (>15 in.) requires back-buttering and medium-bed mortar.", category: "Tile Standards" },
      { code: "NWFA Guidelines", title: "Hardwood Acclimation", description: "Solid hardwood must acclimate in the installation space at final HVAC conditions (65–75°F, 35–55% RH) for minimum 72 hours before installation. Failure causes cupping or gapping.", category: "Wood Flooring" },
      { code: "IRC R315", title: "CO Detectors (Flooring Phase)", description: "If flooring adhesives or coatings with high VOC content are used, adequate ventilation is required during application. Ensure HVAC system is operating during acclimation period.", category: "Safety" },
    ],
    materials: [
      { item: "Engineered hardwood (4-in. white oak)", quantity: "900", unit: "sq ft", estimatedCost: 4500, category: "Flooring" },
      { item: "Underlayment (foam + vapor barrier)", quantity: "900", unit: "sq ft", estimatedCost: 270, category: "Underlayment" },
      { item: "Transition strips (T-molding, reducer)", quantity: "4", unit: "each", estimatedCost: 120, category: "Trim" },
      { item: "Quarter round / base shoe", quantity: "180", unit: "linear ft", estimatedCost: 270, category: "Trim" },
      { item: "Floor adhesive (urethane)", quantity: "5", unit: "gallons", estimatedCost: 250, category: "Adhesive" },
      { item: "Self-leveling underlayment", quantity: "50", unit: "lbs", estimatedCost: 60, category: "Prep" },
      { item: "Stair nosing (matching)", quantity: "2", unit: "each", estimatedCost: 100, category: "Stairs" },
      { item: "Floor finish (hardwood refresher)", quantity: "1", unit: "quart", estimatedCost: 30, category: "Finish" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Demo & Subfloor Prep", low: 400, high: 1200 },
        { category: "Flooring Material", low: 2000, high: 8000 },
        { category: "Installation Labor", low: 1500, high: 4000 },
        { category: "Transitions & Trim", low: 300, high: 800 },
        { category: "Stair Work (if applicable)", low: 0, high: 1500 },
        { category: "Permits (if applicable)", low: 0, high: 200 },
      ],
      totalLow: 4200,
      totalHigh: 15700,
      notes: "Hardwood pricing varies widely — builder-grade LVP $2–3/sqft, good engineered hardwood $5–8/sqft, solid hardwood site-finished $8–15/sqft. Subfloor condition is the biggest unknown cost.",
    },
    designOptions: [
      { title: "Luxury Vinyl Plank (LVP)", style: "Practical Modern", description: "100% waterproof rigid-core LVP with realistic wood look and feel. Click-lock floating installation over most surfaces. Best for high-moisture areas or rental properties.", highlights: ["100% waterproof — suitable for any room", "Floating click-lock over most subfloors", "Highly durable, pet and kid friendly"], estimatedCostAdder: -1500, imageUrl: null },
      { title: "Engineered White Oak", style: "Natural/Contemporary", description: "3/4-in. engineered white oak with 4mm wear layer — hardwood look and feel with better moisture stability than solid. Can be refinished 2–3 times.", highlights: ["Real hardwood surface, refinishable", "Better moisture tolerance than solid", "Wide plank for modern aesthetic"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Site-Finished Solid Hardwood", style: "Premium Traditional", description: "3/4-in. solid hardwood (oak, maple, or walnut) installed then sanded and finished in place for a seamless, custom look. The gold standard — refinishable for generations.", highlights: ["Refinishable for 50+ year lifespan", "Custom stain color on-site", "Highest resale value"], estimatedCostAdder: 4000, imageUrl: null },
    ],
  },
  concrete: {
    regionalCodes: [
      { code: "IRC R403.1", title: "Footing Depth Requirements", description: "Footings must extend below frost depth for your region. Check local frost line depth — it ranges from 0 in. (southern US) to 60+ in. (northern states). Footing width must be minimum twice the wall thickness.", category: "Foundation" },
      { code: "ACI 318", title: "Concrete Strength Requirements", description: "Minimum 2500 PSI for general residential flatwork; 3000 PSI for driveways and garages (freeze-thaw exposure); 4000 PSI for foundations and structural slabs. Water-cement ratio must not exceed 0.50 for exterior applications.", category: "Mix Design" },
      { code: "IRC R506.1", title: "Concrete Floor Slab", description: "Concrete floor slabs must be minimum 3.5 in. thick (4 in. recommended). Base course of crushed stone (4 in. minimum) required. Vapor barrier (10-mil polyethylene) required beneath slab when over soil.", category: "Slab Construction" },
      { code: "IRC R317.1", title: "Drainage Away from Foundation", description: "Ground surface must slope minimum 6 in. drop in first 10 ft away from foundation. Driveways and patios must also drain away from structure at minimum 1% grade.", category: "Drainage" },
    ],
    materials: [
      { item: "Concrete (3000 PSI, air-entrained)", quantity: "10", unit: "cubic yards", estimatedCost: 1400, category: "Concrete" },
      { item: "Rebar (#3 or #4)", quantity: "200", unit: "linear ft", estimatedCost: 300, category: "Reinforcement" },
      { item: "Wire mesh (6x6 W1.4/W1.4)", quantity: "500", unit: "sq ft", estimatedCost: 200, category: "Reinforcement" },
      { item: "Rebar chairs / dobies", quantity: "50", unit: "each", estimatedCost: 25, category: "Reinforcement" },
      { item: "Expansion joint foam (1/2 in.)", quantity: "40", unit: "linear ft", estimatedCost: 60, category: "Joints" },
      { item: "Crushed stone base (4 in.)", quantity: "8", unit: "tons", estimatedCost: 320, category: "Subbase" },
      { item: "Vapor barrier (10-mil poly)", quantity: "600", unit: "sq ft", estimatedCost: 90, category: "Moisture" },
      { item: "Concrete curing compound", quantity: "1", unit: "gallon", estimatedCost: 30, category: "Curing" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Excavation & Grading", low: 600, high: 2000 },
        { category: "Subbase & Compaction", low: 400, high: 1000 },
        { category: "Forms & Layout", low: 300, high: 800 },
        { category: "Reinforcement (rebar/mesh)", low: 300, high: 900 },
        { category: "Concrete Material & Pour", low: 1200, high: 3000 },
        { category: "Finish & Cure", low: 400, high: 1200 },
        { category: "Permits & Inspections", low: 150, high: 400 },
      ],
      totalLow: 3350,
      totalHigh: 9300,
      notes: "Driveway (500 sqft) assumed. Stamped or colored concrete adds $3–8/sqft. Exposed aggregate adds $2–4/sqft. Heated driveway systems add $10–15/sqft for tubing plus boiler.",
    },
    designOptions: [
      { title: "Broom Finish Standard", style: "Classic Functional", description: "Standard broom-finish concrete with control joints and expansion joints at garage door. The most durable, lowest maintenance, and most cost-effective option.", highlights: ["Non-slip broom texture", "Standard 4-in. slab with rebar", "Control joints prevent random cracking"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Stamped & Colored", style: "Decorative", description: "Stamped pattern (flagstone, slate, cobblestone, or wood plank) with integral or broadcast color and release agent. Sealed for protection and sheen.", highlights: ["Custom pattern simulates natural stone", "Integral or surface color options", "Sealed finish for protection"], estimatedCostAdder: 2800, imageUrl: null },
      { title: "Exposed Aggregate", style: "Natural/Textured", description: "Aggregate (river stone, pea gravel, or crushed quartz) exposed by washing surface before set. Non-slip, extremely durable, no sealer needed for basic finish.", highlights: ["Natural stone aggregate surface", "No paint or stain to maintain", "Excellent traction and durability"], estimatedCostAdder: 1200, imageUrl: null },
    ],
  },
  framing: {
    regionalCodes: [
      { code: "IRC R602.3", title: "Wall Stud Spacing & Bracing", description: "Exterior walls may use 2x4 studs at 16-in. OC or 2x6 at 24-in. OC per advanced framing. Structural sheathing (OSB or plywood) required on exterior walls for shear/bracing — let-in bracing alone insufficient in most codes.", category: "Structural" },
      { code: "IRC R602.7", title: "Header Sizing at Openings", description: "Headers over doors and windows in bearing walls must be sized to transfer loads. Refer to IRC Table R602.7. LVL headers are recommended for wide openings — never use two 2x4s for spans over 4 ft.", category: "Structural" },
      { code: "IRC R802.4", title: "Rafter Span Tables", description: "Rafter size and spacing must comply with IRC span tables based on live load, dead load, and lumber species. Ridge board must equal or exceed depth of rafters. Structural ridge beam required if no ceiling ties.", category: "Roof Framing" },
      { code: "IRC R302.11", title: "Fireblocking Required", description: "Concealed framing cavities must be firestopped at ceiling/floor levels, at 10-ft intervals in wall cavities, and around penetrations. Fireblock with solid blocking, mineral wool, or approved intumescent spray.", category: "Fire Safety" },
      { code: "IRC R301.2", title: "Structural Design Criteria", description: "Framing must be designed for the ground snow load, wind speed (mph), seismic design category, and frost depth for your location. Engineer of record required for non-prescriptive designs.", category: "Design Criteria" },
    ],
    materials: [
      { item: "Dimensional lumber 2x6 (framing)", quantity: "80", unit: "each", estimatedCost: 1120, category: "Framing" },
      { item: "LVL header beam (3-1/2 x 11-7/8)", quantity: "20", unit: "linear ft", estimatedCost: 500, category: "Structural" },
      { item: "I-joists (TJI 360, 11-7/8 in.)", quantity: "25", unit: "each", estimatedCost: 1000, category: "Framing" },
      { item: "Rim board (1-1/8 in. LVL)", quantity: "60", unit: "linear ft", estimatedCost: 240, category: "Framing" },
      { item: "OSB sheathing (7/16 in.)", quantity: "40", unit: "sheets", estimatedCost: 800, category: "Sheathing" },
      { item: "Joist hangers + hardware (Simpson)", quantity: "1", unit: "box", estimatedCost: 250, category: "Connectors" },
      { item: "Hurricane ties (H2.5A)", quantity: "30", unit: "each", estimatedCost: 90, category: "Connectors" },
      { item: "Hold-down anchors (HDU5)", quantity: "4", unit: "each", estimatedCost: 200, category: "Connectors" },
      { item: "Structural screws (3 in. LedgerLok)", quantity: "250", unit: "each", estimatedCost: 75, category: "Fasteners" },
      { item: "Pressure-treated sill plate (2x6)", quantity: "50", unit: "linear ft", estimatedCost: 150, category: "Framing" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Foundation Extension (if needed)", low: 0, high: 6000 },
        { category: "Framing Labor", low: 4000, high: 10000 },
        { category: "Lumber & Engineered Wood", low: 3500, high: 8000 },
        { category: "Structural Connectors & Hardware", low: 600, high: 1500 },
        { category: "Roof Framing & Sheathing", low: 2000, high: 5000 },
        { category: "Windows/Door Rough Openings", low: 500, high: 1500 },
        { category: "Engineering & Permits", low: 800, high: 2500 },
      ],
      totalLow: 11400,
      totalHigh: 34500,
      notes: "Costs exclude foundation, MEP, insulation, and drywall. Additions require structural engineering — budget $1,000–2,500 for engineer. Lumber pricing is volatile; get current quotes before finalizing budget.",
    },
    designOptions: [
      { title: "Single-Story Room Addition", style: "Traditional Attached", description: "Conventional stick-framed addition on new continuous footings. Matching exterior to existing roofline and siding for seamless integration. Permit and engineering required.", highlights: ["Conventional 2x6 stud framing at 16-in. OC", "Continuous footing on undisturbed soil", "Matching roof pitch and exterior materials"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Bump-Out (Cantilever)", style: "Minimal Footprint", description: "Small addition (4–8 ft) cantilevered from existing floor joists — no new foundation required if within cantilever limits. Best for kitchen, bay window, or bathroom expansion.", highlights: ["No new foundation needed", "Faster permitting than full addition", "Cost-effective for small expansions (≤8 ft)"], estimatedCostAdder: -8000, imageUrl: null },
      { title: "Second-Story Addition", style: "Maximum Expansion", description: "Full or partial second-story addition over existing footprint. Requires structural assessment of existing walls and foundation. Most disruptive but maximizes square footage without expanding footprint.", highlights: ["Maximum sq footage with no land impact", "No new foundation cost", "Requires structural engineering"], estimatedCostAdder: 15000, imageUrl: null },
    ],
  },
  painting: {
    regionalCodes: [
      { code: "EPA RRP Rule 40 CFR 745", title: "Lead Paint Safety", description: "Pre-1978 homes with disturbed painted surfaces over 6 sqft interior or 20 sqft exterior require EPA RRP-certified contractor. Wet methods and HEPA vacuum required. Homeowners can work on own home but should test first.", category: "Health & Safety" },
      { code: "CARB/OTC VOC Limits", title: "Paint VOC Regulations", description: "Many states (California, Northeast OTC states) restrict VOC content in paint and coatings. Flat wall paint ≤50 g/L; non-flat ≤100 g/L in restricted areas. Verify limits in your region before specifying paint.", category: "Environmental" },
      { code: "NFPA 33", title: "Spray Finishing Safety", description: "Spray application of flammable coatings requires ventilation to maintain concentration below 25% of LEL. Eliminate ignition sources. Use explosion-proof fans if spraying oil-based products.", category: "Fire Safety" },
    ],
    materials: [
      { item: "Premium exterior paint (100% acrylic)", quantity: "8", unit: "gallons", estimatedCost: 480, category: "Exterior" },
      { item: "Exterior primer (bonding)", quantity: "3", unit: "gallons", estimatedCost: 135, category: "Exterior" },
      { item: "Interior wall paint (eggshell)", quantity: "6", unit: "gallons", estimatedCost: 270, category: "Interior" },
      { item: "Interior trim paint (semi-gloss)", quantity: "2", unit: "gallons", estimatedCost: 110, category: "Interior" },
      { item: "Ceiling paint (flat white)", quantity: "3", unit: "gallons", estimatedCost: 105, category: "Interior" },
      { item: "PVA drywall primer", quantity: "2", unit: "gallons", estimatedCost: 80, category: "Primer" },
      { item: "Caulk (paintable polyurethane)", quantity: "8", unit: "tubes", estimatedCost: 64, category: "Prep" },
      { item: "Sandpaper (80/120/220)", quantity: "1", unit: "assortment", estimatedCost: 30, category: "Prep" },
      { item: "Paint roller covers (3/8 nap)", quantity: "6", unit: "each", estimatedCost: 30, category: "Tools" },
      { item: "Drop cloths (canvas)", quantity: "4", unit: "each", estimatedCost: 80, category: "Protection" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Surface Prep & Repair", low: 300, high: 1200 },
        { category: "Priming", low: 400, high: 1000 },
        { category: "Interior Walls & Ceilings", low: 1200, high: 4000 },
        { category: "Interior Trim & Doors", low: 600, high: 2000 },
        { category: "Exterior Body & Trim", low: 1500, high: 5000 },
        { category: "Specialty (cabinets, decks)", low: 0, high: 3000 },
      ],
      totalLow: 4000,
      totalHigh: 16200,
      notes: "Interior only is typically $1.50–3.50/sqft (labor + material). Exterior adds $1.00–3.00/sqft depending on height and trim complexity. Sprayed cabinet finish is the most skill-dependent — get references.",
    },
    designOptions: [
      { title: "Neutral Whole-Home Repaint", style: "Classic Neutral", description: "Coordinated whole-home palette in warm whites, soft greiges, and crisp bright-white trim. Timeless, resale-friendly, and easy to decorate around.", highlights: ["Single coherent palette, 2–3 colors", "Bright white ceilings for light and height", "Classic trim color separates zones"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Bold Accent Strategy", style: "Contemporary Statement", description: "Neutral field colors with one or two bold accent walls or rooms — deep navy, forest green, terracotta, or charcoal — for visual interest and personality without overwhelming.", highlights: ["One or two bold accent rooms", "Neutral transitions in shared spaces", "Designer-level impact at low cost"], estimatedCostAdder: 300, imageUrl: null },
      { title: "Exterior Refresh: Modern Farmhouse", style: "Curb Appeal", description: "Clean white or warm white body with black or dark charcoal trim, shutters, and front door. Black accents at windows, gutters, and light fixtures tie the exterior together.", highlights: ["White body + black trim scheme", "High-contrast curb appeal", "Consistent metal/hardware accent color"], estimatedCostAdder: 800, imageUrl: null },
    ],
  },
  windowsDoors: {
    regionalCodes: [
      { code: "IECC R402.1", title: "Window Energy Performance", description: "Maximum U-factor and SHGC requirements vary by climate zone. Energy Star Northern Zone: U≤0.27. Southern Zone: U≤0.40, SHGC≤0.25. Check your zone before specifying windows.", category: "Energy Code" },
      { code: "IRC R310", title: "Egress Window Requirements", description: "Sleeping rooms must have at least one egress window: minimum 5.7 sqft net clear opening (5.0 sqft at grade floor), minimum 20-in. width, 24-in. height, maximum 44-in. sill height from floor.", category: "Egress/Safety" },
      { code: "IRC R308.4", title: "Safety Glazing Required", description: "Tempered or laminated safety glass required in hazardous locations: within 24 in. of any door, within 36 in. of floor level, in shower enclosures, and adjacent to stairways.", category: "Safety Glazing" },
      { code: "IRC R612", title: "Window Installation & Flashing", description: "Windows must be installed with an approved sill pan flashing and head flashing that drains to the exterior of the WRB. Self-adhered flashing tape minimum 4-in. wide at frame perimeter.", category: "Waterproofing" },
    ],
    materials: [
      { item: "Double-pane low-E windows (vinyl, dh)", quantity: "8", unit: "each", estimatedCost: 4000, category: "Windows" },
      { item: "Fiberglass entry door (pre-hung)", quantity: "1", unit: "each", estimatedCost: 1200, category: "Doors" },
      { item: "Patio door (8-ft sliding, tempered)", quantity: "1", unit: "each", estimatedCost: 2200, category: "Doors" },
      { item: "Sill pan flashing (flexible)", quantity: "1", unit: "allowance", estimatedCost: 200, category: "Flashing" },
      { item: "Flashing tape (4-in. self-adhering)", quantity: "3", unit: "rolls", estimatedCost: 135, category: "Flashing" },
      { item: "Low-expansion window foam", quantity: "4", unit: "cans", estimatedCost: 40, category: "Insulation" },
      { item: "Interior trim (colonial casing)", quantity: "80", unit: "linear ft", estimatedCost: 160, category: "Trim" },
      { item: "Exterior trim (PVC or fiber cement)", quantity: "80", unit: "linear ft", estimatedCost: 320, category: "Trim" },
      { item: "Deadbolt + lockset set", quantity: "1", unit: "set", estimatedCost: 200, category: "Hardware" },
      { item: "Window / door paint", quantity: "1", unit: "gallon", estimatedCost: 55, category: "Finish" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Window Units (material)", low: 3000, high: 10000 },
        { category: "Door Units (material)", low: 1500, high: 6000 },
        { category: "Removal & Disposal", low: 400, high: 1000 },
        { category: "Installation Labor", low: 1500, high: 4000 },
        { category: "Flashing & Air Sealing", low: 300, high: 800 },
        { category: "Interior & Exterior Trim", low: 400, high: 1500 },
        { category: "Permits", low: 150, high: 400 },
      ],
      totalLow: 7250,
      totalHigh: 23700,
      notes: "Window pricing varies widely — builder-grade vinyl $150–300/unit, mid-range $400–700, premium fiberglass $1,000–2,000+. Fiberglass frames outperform vinyl in thermal expansion, strength, and longevity.",
    },
    designOptions: [
      { title: "Vinyl Double-Hung Replacements", style: "Budget-Friendly Modern", description: "Block-frame insert replacement windows — no trim disturbance. Energy Star certified low-E double-pane. Good for straightforward replacements with intact frames.", highlights: ["Insert replacement, minimal trim disturbance", "Energy Star certified U≤0.27", "Argon fill + low-E coating standard"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Fiberglass Casement System", style: "Premium Performance", description: "Fiberglass casement windows with triple-pane glass and warm-edge spacers. Best thermal performance. Crank-out design provides 100% ventilation area and superior air seal when closed.", highlights: ["Fiberglass frame — strongest, best thermal", "Triple-pane for cold climates", "100% ventilation area when fully open"], estimatedCostAdder: 6000, imageUrl: null },
      { title: "Black-Frame Contemporary", style: "Modern/Architectural", description: "Black interior and exterior aluminum-clad or fiberglass frames with large fixed and operating sash. High contrast against light walls — architectural impact inside and out.", highlights: ["Matte black interior + exterior frames", "Large glass area for maximum light", "High-design curb appeal"], estimatedCostAdder: 4500, imageUrl: null },
    ],
  },
  insulation: {
    regionalCodes: [
      { code: "IECC R402.1", title: "Insulation R-Value Requirements", description: "Required R-values vary by climate zone. Zone 3 example: attic R-38, walls R-20 or R-13+5ci. Zone 5: attic R-49, walls R-20 or R-13+10ci. Verify your climate zone and current local adoption before specifying.", category: "Energy Code" },
      { code: "IRC R316.5", title: "Spray Foam Thermal Barrier", description: "Spray polyurethane foam must be covered by a 15-minute thermal barrier (typically 1/2-in. drywall) unless the foam product is specifically listed for exposed installation. Never leave spray foam exposed in occupied or storage areas.", category: "Fire Safety" },
      { code: "ASHRAE 62.2", title: "Ventilation When Tightening Envelope", description: "When air sealing tightens the building below ~5 ACH50 (blower door), mechanical ventilation is required. Supply, exhaust, or balanced ERV/HRV ventilation must be designed and installed.", category: "Ventilation" },
      { code: "IRC R806.1", title: "Attic Ventilation or Sealed Attic", description: "Either provide ventilated attic (1:150 or 1:300 net free area with balanced flow) or create an unventilated conditioned attic (foam on roof deck, no rafter venting needed). Do not mix both strategies.", category: "Attic" },
    ],
    materials: [
      { item: "Blown cellulose (attic, R-49)", quantity: "1500", unit: "sq ft", estimatedCost: 1200, category: "Attic" },
      { item: "Baffles (rafter vents)", quantity: "40", unit: "each", estimatedCost: 120, category: "Attic" },
      { item: "Mineral wool batts (R-15, 2x4 wall)", quantity: "800", unit: "sq ft", estimatedCost: 640, category: "Walls" },
      { item: "Rigid foam XPS (1 in., R-5)", quantity: "500", unit: "sq ft", estimatedCost: 500, category: "Continuous" },
      { item: "Closed-cell spray foam (rim joist)", quantity: "150", unit: "board ft", estimatedCost: 600, category: "Air Sealing" },
      { item: "Fire-rated caulk (penetrations)", quantity: "4", unit: "tubes", estimatedCost: 40, category: "Air Sealing" },
      { item: "Expanding foam (low-expansion)", quantity: "6", unit: "cans", estimatedCost: 48, category: "Air Sealing" },
      { item: "Attic hatch insulation cover", quantity: "1", unit: "each", estimatedCost: 40, category: "Attic" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Attic Air Sealing", low: 400, high: 1000 },
        { category: "Attic Blown Insulation", low: 1000, high: 2500 },
        { category: "Wall Insulation (batts or blown)", low: 1200, high: 4000 },
        { category: "Rim Joist (spray foam)", low: 400, high: 1200 },
        { category: "Crawlspace / Basement Walls", low: 800, high: 2500 },
        { category: "Continuous Insulation (exterior)", low: 0, high: 3000 },
        { category: "Blower Door Test", low: 300, high: 600 },
      ],
      totalLow: 4100,
      totalHigh: 14800,
      notes: "Air sealing delivers the best ROI — seal first, then insulate. Utility rebates commonly cover $0.10–0.20/sqft for blown insulation and $200–400 for blower door testing. Ask your utility for rebate programs.",
    },
    designOptions: [
      { title: "Air Seal + Blown Attic", style: "High-ROI Starter", description: "Comprehensive attic air sealing (top plates, penetrations, hatch) followed by blown cellulose or fiberglass to R-49. The single highest-return insulation investment for most existing homes.", highlights: ["Attic air sealing before insulating", "Blown cellulose to R-49", "Often rebate-eligible from utility"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Deep Energy Retrofit Package", style: "Comprehensive", description: "Full building envelope package: attic, walls (interior blown or exterior continuous), rim joist spray foam, crawlspace/basement, and blower door verification. Combined with mechanical ventilation.", highlights: ["Whole-envelope approach", "Blower door pre/post testing", "Pairs with HVAC right-sizing"], estimatedCostAdder: 5000, imageUrl: null },
      { title: "Closed-Cell Spray Foam Encapsulation", style: "Premium / Unvented Attic", description: "2-in. closed-cell spray foam on roof deck creates a conditioned, unvented attic. HVAC in attic is now inside the envelope — eliminates duct losses and brings equipment to conditioned space.", highlights: ["Fully conditioned unvented attic", "HVAC equipment inside envelope", "Highest performance per inch of thickness"], estimatedCostAdder: 6000, imageUrl: null },
    ],
  },
  drywall: {
    regionalCodes: [
      { code: "IRC R302.6", title: "Garage-to-House Separation", description: "Garage ceiling must be minimum 5/8-in. Type X fire-rated drywall. Garage-to-house common wall must be minimum 1/2-in. gypsum board on the garage side. No openings to sleeping rooms.", category: "Fire Safety" },
      { code: "UL Design No. U305", title: "Fire-Rated Wall Assembly", description: "1-hr fire-rated wall assembly for party walls and multi-family separations typically requires two layers of 5/8-in. Type X drywall on each side with specific stagger, fastener pattern, and joint treatment.", category: "Fire Rating" },
      { code: "ASTM C840", title: "Application & Finishing Standards", description: "Gypsum board must be fastened at maximum 16 in. OC in field and 8 in. at edges for walls, with fastener heads slightly dimpled. Joint compound and taping per GA-214 finishing levels.", category: "Installation" },
      { code: "IRC R702.3.8", title: "Mold-Resistant in Wet Areas", description: "Drywall in wet or damp areas (bathrooms, laundry, exterior walls in humid climates) must be mold-resistant gypsum board. Standard green board is not approved as a tile backer in wet areas.", category: "Moisture" },
    ],
    materials: [
      { item: "1/2-in. drywall (standard)", quantity: "50", unit: "sheets", estimatedCost: 750, category: "Drywall" },
      { item: "5/8-in. Type X drywall", quantity: "20", unit: "sheets", estimatedCost: 380, category: "Fire-Rated" },
      { item: "Mold-resistant drywall (bathrooms)", quantity: "10", unit: "sheets", estimatedCost: 250, category: "Drywall" },
      { item: "Joint compound (all-purpose)", quantity: "3", unit: "5-gal buckets", estimatedCost: 90, category: "Finishing" },
      { item: "Setting compound (Durabond 45)", quantity: "2", unit: "bags", estimatedCost: 40, category: "Finishing" },
      { item: "Paper tape", quantity: "3", unit: "rolls", estimatedCost: 15, category: "Finishing" },
      { item: "Metal corner bead", quantity: "60", unit: "linear ft", estimatedCost: 60, category: "Trim" },
      { item: "Drywall screws (1-5/8 in.)", quantity: "5", unit: "lbs", estimatedCost: 25, category: "Fasteners" },
      { item: "Fiberglass mesh tape (repairs)", quantity: "1", unit: "roll", estimatedCost: 8, category: "Finishing" },
      { item: "PVA drywall primer", quantity: "2", unit: "gallons", estimatedCost: 80, category: "Primer" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Material (drywall + compound)", low: 600, high: 1800 },
        { category: "Hanging Labor", low: 800, high: 2500 },
        { category: "Taping & Finishing (3 coats)", low: 1000, high: 3500 },
        { category: "Sanding & Prep for Paint", low: 300, high: 900 },
        { category: "Corner Bead & Trim", low: 200, high: 500 },
        { category: "Primer Coat", low: 200, high: 500 },
      ],
      totalLow: 3100,
      totalHigh: 9700,
      notes: "Large unobstructed spaces are most efficient to hang. Lots of corners, curves, or archways increase cost. Level 5 finish (skim coat) adds $0.50–1.00/sqft. Texture adds $0.25–0.75/sqft.",
    },
    designOptions: [
      { title: "Standard Level 4 Finish", style: "Residential Standard", description: "Three-coat system (embed, fill, finish) on all taped joints with paper tape on seams and metal bead on corners. Appropriate for eggshell or satin paint sheens. Industry standard for most residential work.", highlights: ["Three-coat taping system", "Metal corner bead on all outside corners", "Ready for eggshell or satin paint"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Level 5 Skim Coat", style: "Premium Smooth", description: "Full wall and ceiling skim coat over taped surface — a thin layer of compound feathered to perfectly smooth. Required for gloss or semi-gloss paints and critical lighting conditions.", highlights: ["Full skim coat on walls and ceilings", "Required for high-sheen paint", "Eliminates all surface variation"], estimatedCostAdder: 1800, imageUrl: null },
      { title: "Knockdown Texture", style: "Texture", description: "Skip-trowel or spray knockdown applied over standard tape — random flattened peaks add character while hiding minor substrate irregularities. Common in Southwest and Mid-Atlantic regions.", highlights: ["Hides minor wall imperfections", "Adds character vs. smooth walls", "Applied by spray or skip-trowel technique"], estimatedCostAdder: 500, imageUrl: null },
    ],
  },
  landscaping: {
    regionalCodes: [
      { code: "IRC R401.3", title: "Drainage Away from Foundation", description: "Final grade must slope minimum 6 in. in first 10 ft away from foundation. Hardscape (patios, driveways) requires minimum 1% slope away from structure. Failure to drain properly causes foundation damage.", category: "Grading" },
      { code: "Local Backflow Code", title: "Irrigation Backflow Prevention", description: "Irrigation systems connected to potable water supply require approved backflow preventers. Most jurisdictions require annual testing and a licensed plumber for installation. Verify local requirements.", category: "Plumbing" },
      { code: "811 / Call Before You Dig", title: "Utility Locate Required", description: "Federal law requires calling 811 a minimum of 3 business days before any digging. Free service marks underground utilities. Never skip this step — damage to lines is costly and dangerous.", category: "Safety" },
      { code: "Local Retaining Wall Permit", title: "Retaining Wall Over 4 Ft", description: "Retaining walls over 4 ft in exposed height typically require a building permit and structural engineering. Walls over 3 ft require a design accounting for soil pressure, drainage, and surcharge loads.", category: "Structural" },
    ],
    materials: [
      { item: "Segmental retaining wall block", quantity: "4", unit: "tons", estimatedCost: 600, category: "Hardscape" },
      { item: "Concrete pavers (3-1/8 in. thick)", quantity: "500", unit: "sq ft", estimatedCost: 1500, category: "Hardscape" },
      { item: "Polymeric jointing sand", quantity: "200", unit: "lbs", estimatedCost: 80, category: "Hardscape" },
      { item: "Landscape fabric (weed barrier)", quantity: "1000", unit: "sq ft", estimatedCost: 80, category: "Planting" },
      { item: "Mulch (shredded hardwood)", quantity: "6", unit: "cubic yards", estimatedCost: 300, category: "Planting" },
      { item: "Topsoil (screened)", quantity: "10", unit: "cubic yards", estimatedCost: 400, category: "Grading" },
      { item: "Irrigation controller (smart)", quantity: "1", unit: "each", estimatedCost: 250, category: "Irrigation" },
      { item: "Irrigation zones (materials/zone)", quantity: "4", unit: "zones", estimatedCost: 800, category: "Irrigation" },
      { item: "Perforated drain pipe (4 in.)", quantity: "60", unit: "feet", estimatedCost: 120, category: "Drainage" },
      { item: "Shrubs & ornamental grasses", quantity: "1", unit: "allowance", estimatedCost: 600, category: "Planting" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Grading & Drainage", low: 800, high: 3000 },
        { category: "Hardscape (pavers, concrete, walls)", low: 2000, high: 12000 },
        { category: "Planting (trees, shrubs, groundcover)", low: 800, high: 4000 },
        { category: "Irrigation System", low: 1500, high: 5000 },
        { category: "Sod or Seed (lawn)", low: 600, high: 3000 },
        { category: "Landscape Lighting", low: 0, high: 3000 },
        { category: "Permits (retaining walls, irrigation)", low: 0, high: 500 },
      ],
      totalLow: 5700,
      totalHigh: 30500,
      notes: "Hardscape is the biggest cost variable. Natural stone adds 30–50% over pavers. Irrigation system is highly regional — $2,000–5,000 for a typical residential system. Tree removal/transplant adds $300–1,500 per tree.",
    },
    designOptions: [
      { title: "Low-Maintenance Native Planting", style: "Naturalistic", description: "Native and adapted plant species that require minimal irrigation once established. Mulched beds, permeable pathways, and rain gardens to manage stormwater naturally.", highlights: ["Native plants require no irrigation after establishment", "Permeable paving reduces runoff", "Rain garden handles stormwater on-site"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Structured Hardscape Retreat", style: "Contemporary Outdoor Living", description: "Large-format concrete or paver patio with built-in seating walls, fire pit, and pergola. Integrated lighting and irrigation for a low-maintenance outdoor room.", highlights: ["Paver patio with seating wall & fire pit", "Pergola for overhead shade", "Integrated LED landscape lighting"], estimatedCostAdder: 8000, imageUrl: null },
      { title: "Formal Symmetry", style: "Traditional/Formal", description: "Symmetrical planting beds flanking entry walk, shaped boxwood hedges, and a classic brick or stone edging system. Seasonal color in defined beds with drip irrigation.", highlights: ["Symmetrical layout for formal curb appeal", "Boxwood hedge structure year-round", "Drip irrigation for low water use"], estimatedCostAdder: 3000, imageUrl: null },
    ],
  },
  basement: {
    regionalCodes: [
      { code: "IRC R310.1", title: "Egress Window Required", description: "Finished basements used as sleeping rooms must have egress windows with min 5.7 sqft net clear opening, 20-in. clear width, 24-in. clear height, and sill max 44 in. from floor.", category: "Egress" },
      { code: "IRC R315.1", title: "Carbon Monoxide Detector", description: "CO detectors required in basements containing fuel-burning appliances or attached garage. Install within 10 ft of sleeping area. Interconnect with whole-home system if hardwired.", category: "Life Safety" },
      { code: "IECC R402.2.9", title: "Basement Insulation", description: "Basement walls must be insulated to meet energy code (varies by climate zone — typically R-10 to R-15 for cold climates). Insulate on interior or exterior of foundation wall, not between framing and foundation.", category: "Energy Code" },
      { code: "IRC R702.3", title: "Framing & Wall Assembly", description: "Basement stud walls must be pressure-treated or separated from concrete by a moisture barrier. Do not place drywall directly on concrete or masonry walls — framing and vapor management required.", category: "Moisture Protection" },
    ],
    materials: [
      { item: "Pressure-treated bottom plate (2x4)", quantity: "120", unit: "linear ft", estimatedCost: 240, category: "Framing" },
      { item: "Studs 2x4 (8-ft)", quantity: "60", unit: "each", estimatedCost: 420, category: "Framing" },
      { item: "Rigid foam (2 in. XPS, R-10)", quantity: "800", unit: "sq ft", estimatedCost: 800, category: "Insulation" },
      { item: "Drywall (1/2-in.)", quantity: "40", unit: "sheets", estimatedCost: 600, category: "Drywall" },
      { item: "LVP flooring (waterproof)", quantity: "700", unit: "sq ft", estimatedCost: 1400, category: "Flooring" },
      { item: "Drop ceiling grid & tiles", quantity: "600", unit: "sq ft", estimatedCost: 900, category: "Ceiling" },
      { item: "Egress window (inc. well)", quantity: "1", unit: "each", estimatedCost: 2500, category: "Windows" },
      { item: "Recessed lights (LED)", quantity: "12", unit: "each", estimatedCost: 600, category: "Electrical" },
      { item: "Bathroom rough-in (if applicable)", quantity: "1", unit: "allowance", estimatedCost: 1500, category: "Plumbing" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Waterproofing (if needed)", low: 0, high: 6000 },
        { category: "Framing & Insulation", low: 2000, high: 5000 },
        { category: "Electrical", low: 1500, high: 4000 },
        { category: "Plumbing (egress + bathroom)", low: 0, high: 5000 },
        { category: "Drywall & Ceiling", low: 2000, high: 5000 },
        { category: "Flooring", low: 1200, high: 4000 },
        { category: "Egress Window", low: 2000, high: 4000 },
        { category: "Permits & Inspections", low: 300, high: 800 },
      ],
      totalLow: 9000,
      totalHigh: 33800,
      notes: "Moisture is the biggest risk in basement finishing — address it BEFORE framing. An interior waterproofing system (drain tile + sump pump) adds $5,000–12,000 but is far cheaper than tearing out a finished basement later.",
    },
    designOptions: [
      { title: "Open Rec Room / Media Space", style: "Family Functional", description: "Open-plan space with LVP flooring, drop or drywall ceiling, recessed lighting, and egress window. Simple built-in media wall and wet bar rough-in.", highlights: ["Open floor plan for flexibility", "LVP waterproof flooring throughout", "Drop ceiling for easy mechanical access"], estimatedCostAdder: 0, imageUrl: null },
      { title: "In-Law Suite / Guest Suite", style: "Livable", description: "Bedroom with egress window, full bathroom, kitchenette rough-in, and separate entrance consideration. Insulation upgraded for sound. Meets egress requirements for sleeping use.", highlights: ["Egress window — legal sleeping room", "Full bathroom + kitchenette rough-in", "Acoustic insulation between floor and basement"], estimatedCostAdder: 12000, imageUrl: null },
      { title: "Home Office + Workshop Combo", style: "Practical/Utilitarian", description: "Finished home office zone with acoustic ceiling tile, commercial-grade LVP, and dedicated circuits. Adjacent unfinished workshop area with sealed concrete, workbench backing, and bright LED shop lighting.", highlights: ["Acoustic ceiling in office zone", "Dedicated 20A circuits for equipment", "Sealed concrete workshop for easy cleanup"], estimatedCostAdder: 2000, imageUrl: null },
    ],
  },
  garage: {
    regionalCodes: [
      { code: "IRC R302.6", title: "Garage-to-House Fire Separation", description: "Garage sharing a wall or ceiling with the house requires: ceiling = 5/8-in. Type X drywall; common walls = minimum 1/2-in. gypsum board on garage side. No openings to sleeping rooms. Required even in unfinished garages.", category: "Fire Safety" },
      { code: "IRC R309.2", title: "Garage Floor Drainage", description: "Garage floor must drain to the outside or an approved collection system. Floors must slope minimum 2% toward drain or door. Do not drain garage floor to sanitary sewer without an oil/water separator.", category: "Drainage" },
      { code: "NEC 210.8(A)(2)", title: "GFCI in Garage", description: "All 120V 15A and 20A receptacles in garages must be GFCI protected. Exception for dedicated appliance circuits like refrigerators if not readily accessible.", category: "Electrical" },
      { code: "IRC R301.2.1", title: "Garage Door Wind Load", description: "In high-wind areas (coastal, hurricane zones), garage doors must resist specified wind pressures. Often requires horizontal bracing, heavier track, or wind-rated door product.", category: "Structural" },
    ],
    materials: [
      { item: "Garage door (16x7, insulated steel)", quantity: "1", unit: "each", estimatedCost: 1200, category: "Door" },
      { item: "LiftMaster belt-drive opener + WiFi", quantity: "1", unit: "each", estimatedCost: 450, category: "Opener" },
      { item: "5/8-in. Type X drywall (ceiling)", quantity: "24", unit: "sheets", estimatedCost: 456, category: "Fire-Rated" },
      { item: "1/2-in. drywall (walls)", quantity: "20", unit: "sheets", estimatedCost: 300, category: "Drywall" },
      { item: "Epoxy floor coating kit", quantity: "1", unit: "2-car kit", estimatedCost: 250, category: "Flooring" },
      { item: "LED shop lights (4 ft, 5000K)", quantity: "6", unit: "each", estimatedCost: 180, category: "Lighting" },
      { item: "GFCI receptacles (20A)", quantity: "4", unit: "each", estimatedCost: 80, category: "Electrical" },
      { item: "240V outlet (for EV or welder)", quantity: "1", unit: "each", estimatedCost: 200, category: "Electrical" },
      { item: "Insulation (R-13 batts, walls)", quantity: "600", unit: "sq ft", estimatedCost: 240, category: "Insulation" },
      { item: "Attic pull-down stair", quantity: "1", unit: "each", estimatedCost: 180, category: "Access" },
    ],
    costEstimate: {
      breakdown: [
        { category: "Garage Door & Opener", low: 1400, high: 4000 },
        { category: "Drywall & Fire-Rating", low: 1200, high: 3000 },
        { category: "Electrical (outlets + lighting)", low: 800, high: 2500 },
        { category: "Floor Coating (epoxy/polyurea)", low: 500, high: 2500 },
        { category: "Insulation (walls + door)", low: 400, high: 1200 },
        { category: "Storage System / Cabinets", low: 0, high: 3000 },
        { category: "Permits", low: 150, high: 400 },
      ],
      totalLow: 4450,
      totalHigh: 16600,
      notes: "A basic garage finish (drywall, lighting, paint) runs $4,000–8,000. Full epoxy floor adds $1,500–3,000 professionally done. EV charger circuit adds $400–900. Carriage-style insulated door is best value upgrade.",
    },
    designOptions: [
      { title: "Functional Workshop Setup", style: "Utility", description: "Drywall walls and ceiling (fire-rated where required), bright LED shop lighting, multiple 20A GFCI circuits along workbench wall, and a 240V outlet for compressor or welder. Sealed concrete floor.", highlights: ["Multiple 20A circuits for tools", "240V outlet for compressor/welder", "Bright 5000K LED shop lighting"], estimatedCostAdder: 0, imageUrl: null },
      { title: "Clean Epoxy Garage", style: "Polished", description: "Full epoxy or polyurea floor coating with broadcast flake for non-slip surface. White drywall walls, new insulated garage door, belt-drive opener, and under-cabinet lighting over workbench.", highlights: ["Polyurea floor with broadcast flake", "Insulated carriage-style door", "Under-cabinet LED work lighting"], estimatedCostAdder: 3000, imageUrl: null },
      { title: "EV-Ready Smart Garage", style: "Future-Ready", description: "Level 2 EV charger (NEMA 14-50 or hardwired 48A EVSE), smart garage door opener with camera, battery-backed outlet for power outages, and pre-wired ceiling for future storage lift.", highlights: ["Level 2 EV charging (48A EVSE)", "Smart opener with camera + app control", "Pre-wired for future overhead storage"], estimatedCostAdder: 2500, imageUrl: null },
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
