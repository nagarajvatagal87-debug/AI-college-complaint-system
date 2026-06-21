import express from "express";
import { downloadReport } from "../controllers/reportController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/download",
  verifyToken,
  downloadReport
);

export default router;