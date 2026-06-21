import express from "express";

import {
  getAdminDashboard,
  complaintsByCategory,
  complaintsByStatus,
  highPriorityComplaints,
} from "../controllers/adminController.js";

const router = express.Router();

// Dashboard Statistics
router.get("/dashboard", getAdminDashboard);

// Complaints By Category
router.get(
  "/complaints-by-category",
  complaintsByCategory
);

// Complaints By Status
router.get(
  "/complaints-by-status",
  complaintsByStatus
);

// High Priority Complaints
router.get(
  "/high-priority",
  highPriorityComplaints
);

export default router;