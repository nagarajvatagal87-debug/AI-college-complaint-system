import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  registerStaff,
  loginStaff,
  getAssignedComplaints,
  updateComplaintStatusByStaff,
  getNotifications
} from "../controllers/staffController.js";
const router = express.Router();

router.post("/register", registerStaff);

router.put(
  "/complaints/:id/status",
  verifyToken,
  updateComplaintStatusByStaff
);
router.post("/login", loginStaff);

router.get(
  "/assigned-complaints",
  verifyToken,
  getAssignedComplaints
);
router.get(
  "/notifications",
  verifyToken,
  getNotifications
);

export default router;