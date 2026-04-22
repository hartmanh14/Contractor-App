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
