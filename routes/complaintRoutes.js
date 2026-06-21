import express from "express";

import {
createComplaint,
getMyComplaints,
updateComplaintStatus,
getStudentDashboard,
addRating,
} from "../controllers/complaintController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create Complaint + Image Upload
router.post(
"/",
verifyToken,
upload.single("image"),
createComplaint
);

// Student Complaints
router.get(
"/my-complaints",
verifyToken,
getMyComplaints
);

// Student Dashboard
router.get(
"/student-dashboard",
verifyToken,
getStudentDashboard
);

// Update Complaint Status
router.put(
"/:id/status",
verifyToken,
updateComplaintStatus
);

// Add Rating
router.post(
"/:id/rating",
verifyToken,
addRating
);

export default router;
