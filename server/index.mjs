import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeProject } from "./analyze.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.post("/api/analyze", analyzeProject);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BuildBoss server running on http://localhost:${PORT}`));
