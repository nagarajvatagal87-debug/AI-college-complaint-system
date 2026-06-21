import express from "express";
import {
  registerStudent,
  loginStudent,
} from "../controllers/studentController.js";

const router = express.Router();

// Register
router.post("/register", registerStudent);

// Login
router.post("/login", loginStudent);

export default router;