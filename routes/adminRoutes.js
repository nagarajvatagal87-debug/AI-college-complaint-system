import express from "express";

import {
  loginAdmin,
  getAdminDashboard,
  getAllComplaints,
  getComplaintById,
  complaintsByCategory,
  complaintsByStatus,
  highPriorityComplaints,
  updateComplaintStatus,
  assignComplaint,
} from "../controllers/adminController.js";
const router = express.Router();
router.post("/login", loginAdmin);
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
router.put(
  "/complaints/:id/assign",
  assignComplaint
);
router.get(
  "/complaints/:id",
  getComplaintById
);

export default router;