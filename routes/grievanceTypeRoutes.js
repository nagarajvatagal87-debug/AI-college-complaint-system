import express from "express";
import {
  createGrievanceType,
  getAllGrievanceTypes,
} from "../controllers/grievanceTypeController.js";

const router = express.Router();

// Create Category
router.post("/", createGrievanceType);

// Get All Categories
router.get("/", getAllGrievanceTypes);

export default router;