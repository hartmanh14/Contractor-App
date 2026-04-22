export const WORKFLOW_STAGES = [
  {
    id: 1, key: "project", icon: "🏗", short: "Project",
    title: "Define Your Project",
    why: "Know what you're building and what it should cost before spending a dime. The AI analysis gives you a realistic cost range, materials list, and regional code requirements.",
  },
  {
    id: 2, key: "budget", icon: "💰", short: "Budget",
    title: "Plan Your Budget",
    why: "Set spending limits for each trade category using the AI estimate as your baseline. Having a written budget is your #1 tool for staying in control.",
  },
  {
    id: 3, key: "hire", icon: "👷", short: "Hire",
    title: "Hire Contractors",
    why: "Find qualified contractors, verify their credentials, and review every quote with AI before signing anything. Most owner-builder mistakes happen at this stage.",
  },
  {
    id: 4, key: "permits", icon: "📋", short: "Permits",
    title: "Secure Permits",
    why: "No work should start without permits. Unpermitted work can void your homeowner's insurance, fail at resale inspection, and require expensive tear-outs.",
  },
  {
    id: 5, key: "schedule", icon: "📅", short: "Schedule",
    title: "Schedule the Work",
    why: "Plan each phase in advance. Contractors who know the schedule show up on time — vague commitments lead to delays and cost overruns.",
  },
  {
    id: 6, key: "track", icon: "📊", short: "Track & Pay",
    title: "Track Progress & Pay",
    why: "Log actual costs as work is completed. Never release full payment without a lien waiver. Holding back a small retainage is your leverage to get punch-list items done.",
  },
  {
    id: 7, key: "closeout", icon: "✅", short: "Closeout",
    title: "Safety & Closeout",
    why: "Verify safety compliance and confirm each phase before final sign-off. A written punch list with the final payment on hold is the only way to ensure everything gets finished.",
  },
];

export const PHASES = [
  "Planning", "Demo", "Foundation", "Framing", "Rough-In",
  "Insulation", "Drywall", "Finishes", "Fixtures", "Punch-Out", "Complete",
];

export const TRADES = [
  "General Contractor", "Plumbing", "Electrical", "HVAC", "Roofing",
  "Framing / Carpentry", "Concrete / Masonry", "Drywall", "Painting",
  "Flooring", "Landscaping", "Insulation", "Windows / Doors", "Tile",
];

export const SUB_STATUSES = ["potential", "active", "inactive"];

export const INSPECTION_STATUSES = ["pending", "scheduled", "passed", "failed"];

export const TRADE_VETTING_TIPS = {
  "Electrical": [
    "Electricians must hold a state electrical license — verify the license number at your state's contractor board website before hiring.",
    "All electrical work beyond simple fixture swaps requires permits and inspections — confirm they pull permits in their own name.",
    "Ask specifically if they use licensed electricians (journeyman or master) on-site, not just helpers.",
    "AFCI and GFCI requirements vary by local code year — confirm they are familiar with your jurisdiction's adopted code.",
  ],
  "Plumbing": [
    "Plumbers must hold a state plumbing license — verify it before hiring.",
    "Rough-plumbing work requires a permit and inspection before walls are closed — insist on this.",
    "Ask if the plumber pulling the permit is the same person doing the work (some contractors sub out without telling you).",
    "Confirm they are familiar with your local water heater permit requirements and backflow prevention rules.",
  ],
  "Roofing": [
    "Roofing is one of the highest-fraud trades — always verify license and insurance before signing anything.",
    "Never pay more than 10% upfront for roofing; materials are ordered and delivered on the day of install.",
    "Require a manufacturer's material warranty in addition to the contractor's labor warranty.",
    "Ask if they use subcontractors and verify those subs are separately insured — you could be liable otherwise.",
  ],
  "HVAC": [
    "HVAC contractors must be EPA 608 certified to handle refrigerants and typically require a state mechanical license.",
    "All HVAC installations require a permit and a final inspection — do not allow work without one.",
    "Get equipment model numbers in writing before signing — contractors sometimes substitute cheaper units.",
    "Confirm the system is sized using a Manual J load calculation, not just gut feel.",
  ],
  "General Contractor": [
    "A GC is responsible for hiring, managing, and paying all subs — require lien waivers from every sub before each payment.",
    "Verify the GC's license covers the full scope of work your project requires.",
    "Require a detailed schedule with milestone dates and tie your payments to those milestones.",
    "Confirm the GC carries general liability ($1M+ recommended) AND workers' compensation insurance.",
  ],
};

export const PHASE_SIGNOFF_CHECKLISTS = {
  "Framing": [
    "Obtain rough framing inspection sign-off from the building department before closing walls.",
    "Verify structural connections match approved plans (beam sizes, post bases, header spans).",
    "Confirm window and door rough openings are correct size and plumb.",
    "Check that hurricane ties, hold-downs, or shear panels are installed if required.",
  ],
  "Rough-In": [
    "All rough plumbing, electrical, and HVAC must pass inspection before insulation is installed.",
    "Pressure-test plumbing lines to confirm no leaks before closing walls.",
    "Verify panel capacity and that circuit mapping is documented for future reference.",
    "Confirm all penetrations through fire-rated assemblies are properly fire-stopped.",
  ],
  "Insulation": [
    "Obtain insulation inspection sign-off confirming R-values meet local energy code.",
    "Verify air sealing is complete at all penetrations, joints, and rim joists.",
    "Confirm vapor barrier placement is correct for your climate zone (inside vs. outside of insulation).",
    "Check that HVAC supply and return are balanced before drywall goes up.",
  ],
  "Drywall": [
    "Confirm ALL inspections are complete — once drywall is up, reopening walls is expensive.",
    "Verify blocking is installed for TV mounts, grab bars, cabinet uppers, and heavy fixtures.",
    "Check corner bead, control joints, and backing for any tile or heavy wall coverings.",
    "Confirm fire blocking is in place at all framing penetrations and top plates.",
  ],
  "Finishes": [
    "Walk through with the contractor and document any defects or punch-list items in writing.",
    "Verify all fixture and appliance model numbers match what was specified and purchased.",
    "Test all plumbing for leaks under pressure and all electrical circuits with a circuit tester.",
    "Confirm grout, caulk, and sealants are applied correctly and not cracked.",
  ],
  "Punch-Out": [
    "Do a complete final walkthrough and create a written punch list before making the final payment.",
    "Test every outlet, switch, fixture, appliance, door, window, and lock.",
    "Confirm all permits have received final sign-off from the building department.",
    "Collect all warranties, manuals, paint codes, and as-built drawings from the contractor.",
  ],
};

export const HIRING_RED_FLAGS = [
  "Asks for more than 30% of the total contract value upfront",
  "Cannot provide a current Certificate of Insurance (COI) directly from their carrier",
  "Wants to skip permits to 'save you money' — this voids your insurance and causes resale problems",
  "Will not provide a written contract — insists on a handshake deal",
  "Quote is significantly (>20%) cheaper than every other bid — a sign of corner-cutting or bait-and-switch",
  "Pressures you to sign immediately or claims the price expires today",
  "Has no physical business address — only a cell phone number",
  "Company was formed very recently with no reviews or references",
  "Wants to be paid only in cash",
  "Cannot name specific subcontractors or verify their insurance",
];

export const HIRING_CONTRACT_MUSTS = [
  "Detailed, line-item scope of work — not just 'remodel kitchen'",
  "Milestone-based payment schedule (no more than 10% to start)",
  "Written start date and target completion date",
  "Written change order procedure — no verbal approvals ever",
  "Contractor's license number and insurance policy numbers on the document",
  "Minimum 1-year workmanship warranty with specific coverage",
  "Contractor is responsible for pulling all required permits",
  "Lien waiver from contractor and all subs required before each payment",
  "Dispute resolution process (mediation before litigation)",
  "Daily worksite cleanup and final debris removal responsibility",
];

export const REFERENCE_QUESTIONS = [
  "Did they show up on time and finish close to the estimated schedule?",
  "Was the final cost close to the original quote, or were there surprise charges?",
  "How did they handle unexpected problems or changes during the project?",
  "Did they keep the worksite clean and communicate proactively?",
  "Were all permits and inspections handled properly?",
  "Would you hire them again for a larger or more complex project?",
];
