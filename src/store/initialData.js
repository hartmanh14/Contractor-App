export const initialProjects = [
  {
    id: 1, name: "Kitchen Remodel", address: "123 Elm St", phase: "Drywall",
    budget: 42000, spent: 28400, startDate: "2025-03-10", endDate: "2025-06-30",
    status: "active", notes: "Cabinets arrive May 15",
    description: "Full gut remodel — new layout, island, updated plumbing and electrical.",
    photos: [],
  },
];

export const initialSubs = [
  {
    id: 1, name: "Dave's Plumbing", trade: "Plumbing", phone: "937-555-0101",
    email: "dave@dplumbing.com", licensed: true, insured: true, rating: 5,
    status: "active", notes: "Very reliable",
    licenseNum: "PL-OH-2024-8812", insuranceExpiry: "2026-06-30", yearsExp: 12, referencesChecked: true,
  },
  {
    id: 2, name: "Bright Electric Co.", trade: "Electrical", phone: "937-555-0202",
    email: "info@brightelectric.com", licensed: true, insured: true, rating: 4,
    status: "active", notes: "Sometimes slow to respond",
    licenseNum: "EC-OH-2024-0312", insuranceExpiry: "2026-03-31", yearsExp: 8, referencesChecked: true,
  },
  {
    id: 3, name: "Solid Frames LLC", trade: "Framing / Carpentry", phone: "937-555-0303",
    email: "solid@frames.com", licensed: false, insured: true, rating: 3,
    status: "potential", notes: "Need to verify license",
    licenseNum: "", insuranceExpiry: "2025-12-31", yearsExp: 5, referencesChecked: false,
  },
];

export const initialPermits = [
  {
    id: 1, projectId: 1, type: "Building", number: "BP-2025-0441",
    issued: "2025-03-01", expires: "2026-03-01", status: "active",
    inspections: [
      { name: "Footing", date: "2025-03-15", status: "passed" },
      { name: "Rough Framing", date: "2025-04-02", status: "passed" },
      { name: "Rough Plumbing", date: "2025-04-10", status: "passed" },
      { name: "Rough Electrical", date: "2025-04-15", status: "scheduled" },
      { name: "Insulation", date: "", status: "pending" },
      { name: "Final", date: "", status: "pending" },
    ],
  },
  {
    id: 2, projectId: 1, type: "Electrical", number: "EP-2025-0112",
    issued: "2025-03-05", expires: "2026-03-05", status: "active",
    inspections: [
      { name: "Rough Electrical", date: "2025-04-15", status: "scheduled" },
      { name: "Final Electrical", date: "", status: "pending" },
    ],
  },
];

export const initialTasks = [
  { id: 1, projectId: 1, title: "Frame inspection sign-off", subId: null, date: "2025-04-02", status: "done", phase: "Framing" },
  { id: 2, projectId: 1, title: "Rough plumbing - Dave's Plumbing", subId: 1, date: "2025-04-08", status: "done", phase: "Rough-In" },
  { id: 3, projectId: 1, title: "Rough electrical - Bright Electric", subId: 2, date: "2025-04-14", status: "done", phase: "Rough-In" },
  { id: 4, projectId: 1, title: "Electrical rough-in inspection", subId: null, date: "2025-04-15", status: "upcoming", phase: "Rough-In" },
  { id: 5, projectId: 1, title: "Insulation install", subId: null, date: "2025-04-22", status: "upcoming", phase: "Insulation" },
  { id: 6, projectId: 1, title: "Drywall hang - day 1", subId: null, date: "2025-04-28", status: "upcoming", phase: "Drywall" },
  { id: 7, projectId: 1, title: "Cabinet delivery & install", subId: null, date: "2025-05-15", status: "upcoming", phase: "Finishes" },
];

export const initialBudget = [
  { id: 1,  projectId: 1, category: "Demo & Haul-Off",       budgeted: 1800,  actual: 1650,  paid: true,  lienWaiver: true  },
  { id: 2,  projectId: 1, category: "Plumbing - Rough",      budgeted: 4200,  actual: 4200,  paid: true,  lienWaiver: true  },
  { id: 3,  projectId: 1, category: "Electrical - Rough",    budgeted: 3800,  actual: 3900,  paid: true,  lienWaiver: false },
  { id: 4,  projectId: 1, category: "Insulation",            budgeted: 1400,  actual: 0,     paid: false, lienWaiver: false },
  { id: 5,  projectId: 1, category: "Drywall",               budgeted: 3200,  actual: 0,     paid: false, lienWaiver: false },
  { id: 6,  projectId: 1, category: "Cabinets & Hardware",   budgeted: 11000, actual: 10800, paid: false, lienWaiver: false },
  { id: 7,  projectId: 1, category: "Countertops",           budgeted: 4500,  actual: 0,     paid: false, lienWaiver: false },
  { id: 8,  projectId: 1, category: "Tile & Flooring",       budgeted: 3800,  actual: 3850,  paid: true,  lienWaiver: true  },
  { id: 9,  projectId: 1, category: "Fixtures & Appliances", budgeted: 6200,  actual: 0,     paid: false, lienWaiver: false },
  { id: 10, projectId: 1, category: "Paint",                 budgeted: 900,   actual: 0,     paid: false, lienWaiver: false },
  { id: 11, projectId: 1, category: "Permits & Fees",        budgeted: 1200,  actual: 1150,  paid: true,  lienWaiver: true  },
];

export const initialDIYProjects = [
  {
    id: 101, name: "Paint Living Room", room: "Living Room",
    description: "Repaint all four walls — currently a dark brown, switching to a warm greige.",
    budget: 200, difficulty: "beginner", status: "in-progress",
    completedSteps: [1, 2], boughtMaterials: [0, 1, 2, 3, 4, 5], photos: [],
    aiAnalysis: {
      difficulty: "beginner",
      difficultyReason: "No special skills needed — patience and proper prep are all it takes.",
      totalTimeHours: 6,
      timeBreakdown: "2.5 hrs active work + 3.5 hrs drying time between coats",
      estimatedTotalCost: 145,
      materials: [
        { item: "Interior latex paint (eggshell)", qty: "2", unit: "gal", cost: 70, store: "Paint dept", notes: "Eggshell is easier to clean than flat — great for living spaces" },
        { item: "Painter's tape (1.5 in)", qty: "3", unit: "rolls", cost: 12, store: "Painting supplies", notes: "FrogTape gives cleaner edges than generic blue tape" },
        { item: "Plastic drop cloth", qty: "2", unit: "each", cost: 8, store: "Painting supplies" },
        { item: "9-in roller cover (3/8 nap)", qty: "3", unit: "each", cost: 12, store: "Painting supplies" },
        { item: "Paint tray + liner", qty: "1", unit: "set", cost: 6, store: "Painting supplies" },
        { item: "Angled sash brush (2.5 in)", qty: "1", unit: "each", cost: 12, store: "Painting supplies" },
        { item: "Sandpaper (120-grit)", qty: "1", unit: "pack", cost: 5, store: "Abrasives" },
        { item: "Spackling compound", qty: "1", unit: "small tub", cost: 8, store: "Drywall & repair" },
        { item: "Interior primer", qty: "1", unit: "qt", cost: 12, store: "Paint dept", notes: "Only needed if painting over a dark color" },
      ],
      tools: [
        { item: "9-in roller frame", action: "buy", cost: 8, notes: "Get one with a threaded handle for the extension pole" },
        { item: "Roller extension pole", action: "buy", cost: 12, notes: "Saves your back on high walls" },
        { item: "Putty knife (3-in)", action: "buy", cost: 5 },
        { item: "Stepladder", action: "have", cost: 0 },
        { item: "Bucket + sponge", action: "have", cost: 0 },
      ],
      steps: [
        { number: 1, title: "Clear and protect the room", timeMinutes: 30, description: "Move furniture to the center and cover with drop cloths. Remove outlet covers, switch plates, and wall fixtures. Place drop cloths along all walls on the floor. Take a photo of each outlet before removing the cover.", tips: "Photos make reinstalling outlets fast and foolproof.", warning: null },
        { number: 2, title: "Clean walls and repair imperfections", timeMinutes: 30, description: "Wipe all walls with a damp sponge to remove dust, grease, and grime — paint won't adhere to dirty surfaces. Fill every nail hole and crack with spackling compound. Overfill slightly; it shrinks as it dries. Let dry 30–60 min.", tips: "Rake a work light at a low angle across the wall to reveal every dent and hole that overhead light hides.", warning: null },
        { number: 3, title: "Sand patches and prime", timeMinutes: 30, description: "Sand spackled spots flush with 120-grit sandpaper and wipe off dust. Apply primer to patched areas only — or full walls if changing from a dark color. Let dry per label.", tips: "Tinted primer matched to your finish color reduces the coats of paint you'll need.", warning: null },
        { number: 4, title: "Apply painter's tape to all edges", timeMinutes: 30, description: "Apply tape carefully along all trim, baseboards, ceiling lines, and window/door frames. Press firmly along the tape edge with the putty knife to seal against bleed-through.", tips: "Remove tape at a 45° angle back over itself while the final coat is still slightly wet — not after it's cured — for the cleanest edge.", warning: null },
        { number: 5, title: "Cut in edges with brush", timeMinutes: 45, description: "Load the angled brush and paint a 2–3 inch band along every taped edge, corner, and area too tight for the roller. Work one wall at a time with long, feathered strokes.", tips: "Cut in and roll the same wall while the cut-in edge is still wet so the two textures blend invisibly.", warning: null },
        { number: 6, title: "Roll the first coat", timeMinutes: 60, description: "Apply paint in a large W pattern, then fill in without lifting the roller. Work top to bottom in 3-foot sections. Maintain a wet edge and overlap each section slightly. Let dry 2+ hours.", tips: "Don't press hard on the roller — let the weight of the tool do the work. Pressing hard creates spray and streaks.", warning: null },
        { number: 7, title: "Second coat and cleanup", timeMinutes: 75, description: "Apply second coat perpendicular to the first for even coverage. Once dry, remove tape slowly. Reinstall all outlets and fixtures. Clean brushes and roller covers with warm water until clear.", tips: "Press plastic wrap directly onto leftover paint in the can before sealing it — it stays fresh for touch-ups for months.", warning: null },
      ],
      tips: [
        "Buy 10% more paint than your square footage estimate — you'll use it for touch-ups",
        "Test a swatch on the wall and check it in daylight AND lamp light before buying the full quantity",
        "Don't shake the can — slowly roll it on the floor to mix without introducing bubbles",
        "Ventilate the room with a fan even with low-VOC paint",
      ],
      safetyNotes: [
        "Open windows and run a fan — paint fumes cause headaches even in low-VOC products",
        "Use a stable ladder positioned correctly — never stand on the top two rungs of a stepladder",
        "Wear old clothes; latex paint washes off skin with soap and water while wet",
      ],
      imagePrompt: "Photorealistic architectural interior rendering of a freshly repainted living room with smooth warm greige walls, bright natural light from large windows, crisp white crown molding and baseboards, cozy neutral sofa, area rug, houseplants, framed art, modern and inviting atmosphere",
      imageUrl: null,
    },
  },
  {
    id: 102, name: "Install Floating Shelves", room: "Home Office",
    description: "Mount 3 floating shelves on the main wall for books and decor. Wall is drywall.",
    budget: 100, difficulty: "beginner", status: "planning",
    completedSteps: [], boughtMaterials: [], photos: [],
    aiAnalysis: {
      difficulty: "beginner",
      difficultyReason: "Requires a drill but no advanced skills — careful measuring is the key.",
      totalTimeHours: 3,
      timeBreakdown: "2.5 hrs active work",
      estimatedTotalCost: 82,
      materials: [
        { item: "Floating shelf brackets (pair)", qty: "3", unit: "pair", cost: 30, store: "Hardware", notes: "Get brackets rated 50+ lbs per pair if holding books" },
        { item: "Shelving boards (1×8 pine, 48 in)", qty: "3", unit: "board", cost: 24, store: "Lumber", notes: "Pre-finished melamine is ready to use; raw pine needs sanding and staining" },
        { item: "Heavy-duty drywall anchors (50 lb)", qty: "1", unit: "pack", cost: 8, store: "Fasteners", notes: "Only if screws can't hit studs" },
        { item: "Wood screws (2.5 in)", qty: "1", unit: "box", cost: 7, store: "Fasteners" },
        { item: "Paint or stain to match trim", qty: "1", unit: "qt", cost: 10, store: "Paint dept", notes: "Match existing woodwork for a built-in look" },
        { item: "Wood filler", qty: "1", unit: "small tube", cost: 3, store: "Paint & repair" },
      ],
      tools: [
        { item: "Cordless drill/driver", action: "have", cost: 0 },
        { item: "Stud finder", action: "buy", cost: 15, notes: "Essential for secure mounting — don't skip it" },
        { item: "24-in level", action: "buy", cost: 12, notes: "A longer level gives more accurate results than a short torpedo level" },
        { item: "Tape measure", action: "have", cost: 0 },
        { item: "Pencil + painter's tape (for marking)", action: "have", cost: 0 },
      ],
      steps: [
        { number: 1, title: "Plan placement and spacing", timeMinutes: 15, description: "Mark the desired shelf heights lightly on the wall with pencil. A common vertical spacing is 12–16 inches. Consider what you're storing: books need deeper, stronger shelves than decor. Hold a board against the wall and step back to visualize.", tips: "Take a photo of your mockup placement — it's easy to second-guess yourself mid-install.", warning: null },
        { number: 2, title: "Find and mark wall studs", timeMinutes: 15, description: "Run the stud finder horizontally along each shelf height and mark stud centers with pencil on painter's tape. Studs are typically 16 inches apart. Aim to hit at least one stud per bracket for maximum strength.", tips: "If studs aren't where you need them, shift the shelf position slightly rather than relying on drywall anchors alone for a heavy load.", warning: "Never mount shelves that will hold books or heavy objects using only drywall anchors — they can pull out." },
        { number: 3, title: "Mark bracket screw positions", timeMinutes: 15, description: "Hold each bracket against the wall at the marked height and use the level to confirm it's plumb. Mark each screw hole location with a sharp pencil. Step back and verify the position looks right before drilling.", tips: "Use a long level or snap a chalk line to keep all three shelves at consistent heights across the wall.", warning: null },
        { number: 4, title: "Drill pilot holes and mount brackets", timeMinutes: 30, description: "Drill a 1/8-inch pilot hole at each mark. If hitting a stud, drive the 2.5-inch screw directly. For drywall-only spots, install the anchor first, then drive the screw. Mount brackets and confirm each one is snug and level.", tips: "Apply slight downward pressure when drilling drywall to avoid crumbling. Slower drill speed gives more control near edges.", warning: null },
        { number: 5, title: "Prepare and hang the shelf boards", timeMinutes: 45, description: "If using raw wood, sand and apply your finish; let dry fully. Set each shelf board on its mounted brackets. Drill small pilot holes up through the bracket tabs into the board, then secure with shorter screws. Recheck level.", tips: "A thin bead of construction adhesive on the bracket before setting the shelf adds strength and eliminates any visible fasteners from above.", warning: null },
        { number: 6, title: "Fill, touch up, and style", timeMinutes: 15, description: "Fill any visible screw holes with wood filler, let dry, and touch up with paint or stain. Load each shelf to test stability — everything should be rock solid. Style in groups of odd numbers with varying heights for a natural look.", tips: "When a shelf wobbles slightly, a small felt pad under the back edge of the board on the bracket usually fixes it.", warning: null },
      ],
      tips: [
        "Always try to hit a stud with at least one bracket per shelf — shift the position slightly if needed",
        "Pre-drill all pilot holes slightly smaller than your screw diameter to prevent wood splitting",
        "Put a piece of tape on your drill bit at the correct depth so you don't drill too deep",
        "A 4-foot level resting across all three bracket positions at once shows any height inconsistency immediately",
      ],
      safetyNotes: [
        "Wear safety glasses when drilling overhead or into walls — debris falls",
        "Check inside the wall for electrical wires and pipes before drilling — use an AC stud finder or check near outlets",
        "Test every anchor by pulling firmly before loading with weight",
      ],
      imagePrompt: "Photorealistic interior photography of three elegant floating wooden shelves mounted on a clean white wall in a modern home office, neatly organized with books, small plants, framed photos, and decorative objects, warm natural wood tone shelves with simple metal brackets, professional interior design styling, soft natural light",
      imageUrl: null,
    },
  },
];

export const initialSafetyItems = [
  { id: 1, text: "First aid kit on-site",               done: true  },
  { id: 2, text: "Fire extinguisher accessible",         done: true  },
  { id: 3, text: "All subs carry liability insurance",   done: true  },
  { id: 4, text: "Hard hats available for visitors",     done: false },
  { id: 5, text: "Electrical panels clearly labeled",    done: false },
  { id: 6, text: "Walkways clear of debris daily",       done: true  },
  { id: 7, text: "OSHA safety poster posted",            done: false },
  { id: 8, text: "Emergency contacts posted on-site",    done: true  },
];
