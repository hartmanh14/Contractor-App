import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeProject } from "./analyze.mjs";
import { reviewContract } from "./reviewContract.mjs";
import { analyzeDIY } from "./analyzeDIY.mjs";
import { routeToAgent, detectTrade } from "./agents/index.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.post("/api/analyze", analyzeProject);
app.post("/api/review-contract", reviewContract);
app.post("/api/analyze-diy", analyzeDIY);

// Specialized trade agent endpoint — auto-detects trade from project name/description
// or accepts an explicit `trade` field in the request body.
app.post("/api/analyze-trade", async (req, res) => {
  try {
    const { trade, analysis } = await routeToAgent(req.body);
    res.json({ success: true, trade, analysis });
  } catch (err) {
    console.error("Trade agent error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Detect trade without running full analysis (lightweight helper for UI hints)
app.post("/api/detect-trade", (req, res) => {
  const { name = "", description = "" } = req.body;
  res.json({ trade: detectTrade(name, description) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BuildBoss server running on http://localhost:${PORT}`));
