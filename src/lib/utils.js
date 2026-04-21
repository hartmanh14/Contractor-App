export function fmt(n) {
  return "$" + (n ?? 0).toLocaleString();
}

export function generateMockContractors(trade, city = "your area") {
  const bases = {
    "General Contractor": ["Summit Build Group", "Cornerstone Construction", "Apex Builders", "Homestead GC", "Ridgeline Contracting"],
    "Plumbing": ["PipeMasters LLC", "Reliable Plumbing Co.", "Flow Right Services", "Clear Drain Plumbing", "AquaPro Solutions"],
    "Electrical": ["Volt Solutions", "Spark Electric", "CurrentTech", "ProWire Electric", "Bright Side Electric"],
    "HVAC": ["ComfortZone HVAC", "Arctic Air Systems", "TempRight Inc.", "ClimateControl Pro", "Cool Breeze Services"],
    "Roofing": ["Summit Roofing", "Peak Shield Roofing", "Overhead Pros", "StormGuard Roofing", "Apex Roof & Gutter"],
    "Framing / Carpentry": ["Precision Framing LLC", "Timber & Nail Co.", "FrameRight Builders", "SturdiFrame Inc.", "Woodcraft Framing"],
    "Concrete / Masonry": ["SolidBase Concrete", "Masonry Masters", "Foundation Pros", "StoneSet LLC", "Level Ground Inc."],
    "Drywall": ["SmoothFinish LLC", "DryWall Direct", "Board & Tape Co.", "ProWall Services", "Seamless Drywall"],
    "Painting": ["ColorPro Painters", "Elite Finish Co.", "PaintRight LLC", "True Coat Painting", "Premier Brush Works"],
    "Flooring": ["FloorKing", "Surface Solutions", "Precision Flooring Co.", "TopGrain Floors", "All-Floor Pros"],
  };

  const names = bases[trade] ?? bases["General Contractor"];
  const ratings =      [4.9, 4.7, 4.5, 4.3, 4.1, 3.9];
  const bbbRatings =   ["A+", "A+", "A",  "A",  "A-", "B+"];
  const reviewCounts = [312,  87,  224,  45,  178,  63];

  return names.slice(0, 6).map((name, i) => ({
    id: `mock-${trade}-${i}`,
    name,
    trade,
    vicinity: `${(Math.random() * 8 + 0.5).toFixed(1)} mi · ${city}`,
    phone: `(${Math.floor(Math.random() * 800 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    googleRating: ratings[i],
    googleReviews: reviewCounts[i],
    bbbRating: bbbRatings[i],
    bbbAccredited: i % 3 !== 2,
    licensed: i % 5 !== 4,
    insured: i % 6 !== 5,
    source: "mock",
  }));
}
