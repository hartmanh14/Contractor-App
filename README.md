# BuildBoss — Owner-Builder Command Center

Your personal construction management app. Track projects, find and vet subcontractors, manage permits, schedule tasks, and keep budgets on track — all in one place.

---

## Before You Start

You need two things installed on your computer:

- **Node.js** — download at [nodejs.org](https://nodejs.org) (choose the LTS version)
- **Git** — already installed if you pushed this repo

To verify both are ready, open a terminal and run:
```
node --version
npm --version
```
Both should print a version number. If they do, you're ready.

---

## Step 1: Get the Code on Your Machine

If you haven't cloned the repo yet:
```
git clone https://github.com/hartmanh14/Contractor-App.git
cd Contractor-App
```

If you already have it, just pull the latest:
```
cd Contractor-App
git pull
```

---

## Step 2: Install Dependencies

This only needs to be done once (or after pulling in major changes):
```
npm install
```

You'll see a `node_modules/` folder appear. That's normal — it's not committed to git.

---

## Step 3: Run the App

```
npm run dev
```

Your browser will open automatically at `http://localhost:3000`. The app hot-reloads — any change you save in a file shows up instantly without refreshing.

To stop it, press `Ctrl + C` in the terminal.

---

## Step 4: Swap In Your Real Data

The app ships with sample data (a fake kitchen remodel, placeholder subs, etc.). Here's how to replace it with your actual project.

Open this file:
```
src/store/initialData.js
```

### 4a. Your Project

Find `initialProjects` and replace the example entry:

```js
export const initialProjects = [
  {
    id: 1,
    name: "YOUR PROJECT NAME",          // e.g. "Master Bath Addition"
    address: "YOUR ADDRESS",            // e.g. "456 Oak Dr, Columbus OH"
    phase: "Planning",                  // where you are right now
    budget: 00000,                      // your total budget in dollars
    spent: 0,
    startDate: "2026-00-00",            // YYYY-MM-DD format
    endDate:   "2026-00-00",
    status: "active",
    description: "What needs done — scope of work, goals, anything useful to remember.",
    notes: "",
    photos: [],
  },
];
```

Phases you can pick from (in order):
`Planning → Demo → Foundation → Framing → Rough-In → Insulation → Drywall → Finishes → Fixtures → Punch-Out → Complete`

### 4b. Your Subcontractors

Find `initialSubs` and replace with the contractors you already have relationships with:

```js
export const initialSubs = [
  {
    id: 1,
    name: "Company Name",
    trade: "Plumbing",       // see full trade list below
    phone: "555-555-5555",
    email: "email@example.com",
    licensed: true,          // true or false
    insured: true,
    rating: 5,               // your personal 1–5 rating
    status: "active",        // "active", "potential", or "inactive"
    notes: "Any notes about working with them",
  },
  // add more...
];
```

Available trades:
`General Contractor, Plumbing, Electrical, HVAC, Roofing, Framing / Carpentry, Concrete / Masonry, Drywall, Painting, Flooring, Landscaping, Insulation, Windows / Doors, Tile`

### 4c. Your Permits

If you have permits pulled already, add them under `initialPermits`. If not, leave it as an empty array:

```js
export const initialPermits = [];
```

When permits are in hand, each one looks like:

```js
{
  id: 1,
  projectId: 1,              // must match your project's id above
  type: "Building",          // "Building", "Electrical", "Plumbing", etc.
  number: "BP-2026-XXXX",    // the number on your permit card
  issued: "2026-00-00",
  expires: "2027-00-00",
  status: "active",
  inspections: [
    { name: "Footing",       date: "", status: "pending" },
    { name: "Rough Framing", date: "", status: "pending" },
    { name: "Final",         date: "", status: "pending" },
  ],
}
```

Inspection statuses: `pending → scheduled → passed / failed`

### 4d. Budget Line Items

Find `initialBudget` and fill in your actual cost categories:

```js
export const initialBudget = [
  { id: 1, projectId: 1, category: "Demo & Haul-Off",   budgeted: 0000, actual: 0, paid: false },
  { id: 2, projectId: 1, category: "Plumbing Rough-In", budgeted: 0000, actual: 0, paid: false },
  // add a row for every trade or cost category you're tracking
];
```

- `budgeted` — your estimate or quote
- `actual` — what you actually paid (fill in as you go)
- `paid` — flip to `true` once the check clears

### 4e. Clear Out Sample Safety Items

Find `initialSafetyItems` and replace with items relevant to your actual job site, or just clear the array and add them through the app:

```js
export const initialSafetyItems = [];
```

---

## Step 5: Enable Live Contractor Search (Optional)

Out of the box the Find Subs tab shows demo data. To get real nearby contractors:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → enable the **Places API**
3. Create an API key
4. In your project folder, copy the env template:
   ```
   cp .env.example .env
   ```
5. Open `.env` and paste your key:
   ```
   VITE_GOOGLE_PLACES_API_KEY=AIza...your key here
   ```
6. Restart the dev server (`Ctrl+C`, then `npm run dev` again)

The Find Subs tab will now return real results near your location. BBB and Yelp links always work regardless — they open in your browser.

> Note: Google gives $200/month of free API usage, which is plenty for personal use.

---

## Step 6: Add Photos to a Project

1. Go to the **Projects** tab
2. Click **+ New Project** or open an existing one
3. In the wizard, Step 2 is the photo upload — drag and drop or click to browse
4. Add captions to photos (useful for "before" shots, problem areas, inspector notes)
5. Photos are viewable in a full lightbox from the project card

---

## Day-to-Day Usage

Once set up, here's how the app fits into a real build:

| Tab | When to use it |
|---|---|
| **Dashboard** | Morning check-in — budget, next inspection, upcoming tasks |
| **Projects** | Switch between projects, view photos |
| **Find Subs** | Need a new trade? Search near your address, save to your list |
| **Subs** | Call, email, or review subs you're working with |
| **Permits** | Log inspection dates as they happen, track what's passed |
| **Schedule** | Add tasks as work is assigned, check them off as it's done |
| **Budget** | Enter actual costs after each invoice, mark paid when settled |
| **Safety** | Weekly site walkthrough — check items off, add new ones |

---

## Saving Your Data Between Sessions

Right now the app stores everything in memory — if you refresh the page, it reloads from `initialData.js`. That's intentional for now; it means your source file is your database.

**Workflow while building:** After a work day, update the `actual` costs and task statuses directly in `initialData.js`, then save. Your data persists because it's in the file.

When you're ready to add real persistence (login, cloud save, mobile access), that's the upgrade path — but it requires nothing for personal use right now.

---

## Making Changes to the App

All feature code lives in `src/features/`. Each tab is its own folder:

```
src/features/
  dashboard/    ← edit Dashboard.jsx to change the summary view
  projects/     ← NewProjectWizard.jsx controls the new project form
  find-subs/    ← ContractorCard.jsx controls what shows per result
  subs/         ← SubForm.jsx controls the add/edit fields
  permits/      ← Permits.jsx
  schedule/     ← Schedule.jsx
  budget/       ← Budget.jsx
  safety/       ← Safety.jsx
```

Shared things (buttons, badges, modals) live in `src/components/ui/` — change them once, updates everywhere.

---

## Pushing Changes to GitHub

After any update you want to keep:
```
git add -A
git commit -m "describe what you changed"
git push
```

---

## Quick Reference

```bash
npm install        # first time setup
npm run dev        # start the app (localhost:3000)
npm run build      # build for production (creates dist/ folder)
git pull           # get latest changes
git push           # save your changes to GitHub
```
