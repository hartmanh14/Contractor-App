import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeProject } from "./analyze.mjs";
import { reviewContract } from "./reviewContract.mjs";
import { analyzeDIY } from "./analyzeDIY.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.post("/api/analyze", analyzeProject);
app.post("/api/review-contract", reviewContract);
app.post("/api/analyze-diy", analyzeDIY);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BuildBoss server running on http://localhost:${PORT}`));
