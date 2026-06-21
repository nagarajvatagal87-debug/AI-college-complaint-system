import express from "express";
import { analyzeComplaintAI } from "../controllers/aiController.js";

const router = express.Router();

// Analyze Complaint using AI
router.post("/analyze", analyzeComplaintAI);

export default router;