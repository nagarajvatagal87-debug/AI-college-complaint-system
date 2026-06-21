import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";


import studentRoutes from "./routes/studentRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import grievanceTypeRoutes from "./routes/grievanceTypeRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import { sendEmail } from "./services/emailService.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Static Folder for Uploaded Images
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/grievance-types", grievanceTypeRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use(
  "/api/reports",
  reportRoutes
);
// Home Route
app.get("/", (req, res) => {
  res.send("AI College Complaint Redressal System Backend Running");
});

// Email Test Route
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "nagarajvatagal2003@gmail.com",
      "College Complaint AI Test",
      "Email service is working successfully!"
    );

    res.status(200).json({
      success: true,
      message: "Email Sent Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});