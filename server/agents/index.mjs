import { analyzeRoofing } from "./roofingAgent.mjs";
import { analyzeSiding } from "./sidingAgent.mjs";
import { analyzeCabinetry } from "./cabinetryAgent.mjs";
import { analyzeElectrical } from "./electricalAgent.mjs";
import { analyzePlumbing } from "./plumbingAgent.mjs";
import { analyzeHVAC } from "./hvacAgent.mjs";
import { analyzeFlooring } from "./flooringAgent.mjs";
import { analyzeConcrete } from "./concreteAgent.mjs";
import { analyzeFraming } from "./framingAgent.mjs";
import { analyzePainting } from "./paintingAgent.mjs";
import { analyzeWindowsDoors } from "./windowsDoorsAgent.mjs";
import { analyzeInsulation } from "./insulationAgent.mjs";
import { analyzeDrywall } from "./drywallAgent.mjs";
import { analyzeLandscaping } from "./landscapingAgent.mjs";
import { analyzeGeneral } from "./generalAgent.mjs";

export const TRADE_KEYWORDS = {
  roofing:      ["roof", "shingle", "gutter", "soffit", "fascia", "flashing", "re-roof", "metal roof", "flat roof", "eave"],
  siding:       ["siding", "cladding", "hardie", "vinyl siding", "fiber cement", "stucco", "exterior wall cladding", "board and batten"],
  cabinetry:    ["cabinet", "cabinetry", "built-in", "millwork", "casework", "vanity cabinet", "pantry"],
  electrical:   ["electrical", "panel upgrade", "rewire", "circuit", "meter base", "service upgrade", "generator hookup"],
  plumbing:     ["plumbing", "repipe", "water heater", "tankless", "sewer line", "drain", "fixture rough-in"],
  hvac:         ["hvac", "furnace", "heat pump", "mini-split", "ductwork", "air handler", "air conditioning", "boiler"],
  flooring:     ["hardwood floor", "flooring", "lvp", "laminate floor", "tile floor", "carpet", "subfloor"],
  concrete:     ["concrete", "driveway", "sidewalk", "patio slab", "foundation repair", "slab", "footings", "retaining"],
  framing:      ["addition", "room addition", "structural", "load-bearing", "wall removal", "second story", "bump-out"],
  painting:     ["paint", "painting", "exterior paint", "interior paint", "stain", "primer", "repaint"],
  windowsDoors: ["window replacement", "door replacement", "new windows", "entry door", "sliding glass door", "skylights"],
  insulation:   ["insulation", "spray foam", "blown-in", "attic insulation", "crawlspace insulation", "air sealing"],
  drywall:      ["drywall", "sheetrock", "gypsum", "plaster repair", "ceiling repair", "wall repair"],
  landscaping:  ["landscaping", "hardscape", "lawn", "irrigation", "garden", "grading", "drainage", "retaining wall"],
};

const AGENTS = {
  roofing:      analyzeRoofing,
  siding:       analyzeSiding,
  cabinetry:    analyzeCabinetry,
  electrical:   analyzeElectrical,
  plumbing:     analyzePlumbing,
  hvac:         analyzeHVAC,
  flooring:     analyzeFlooring,
  concrete:     analyzeConcrete,
  framing:      analyzeFraming,
  painting:     analyzePainting,
  windowsDoors: analyzeWindowsDoors,
  insulation:   analyzeInsulation,
  drywall:      analyzeDrywall,
  landscaping:  analyzeLandscaping,
  general:      analyzeGeneral,
};

export function detectTrade(name = "", description = "") {
  const text = (name + " " + description).toLowerCase();
  for (const [trade, keywords] of Object.entries(TRADE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return trade;
  }
  return "general";
}

export async function routeToAgent(projectData) {
  const trade = projectData.trade || detectTrade(projectData.name, projectData.description);
  const agentFn = AGENTS[trade] ?? AGENTS.general;
  const analysis = await agentFn(projectData);
  return { trade, analysis };
}
