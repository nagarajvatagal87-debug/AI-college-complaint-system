import express from "express";

import {
  getAdminDashboard,
  getAllComplaints,
  getComplaintById,
  complaintsByCategory,
  complaintsByStatus,
  highPriorityComplaints,
  updateComplaintStatus,
} from "../controllers/adminController.js";
const router = express.Router();

// Dashboard Statistics
router.get("/dashboard", getAdminDashboard);

// View All Complaints
router.get("/complaints", getAllComplaints);
router.get("/complaints", getAllComplaints);


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
router.put(
  "/complaints/:id/status",
  updateComplaintStatus
);
router.get(
  "/complaints/:id",
  getComplaintById
);

export default router;