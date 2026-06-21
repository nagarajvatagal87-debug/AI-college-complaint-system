import { db } from "../config/db.js";
import { sendEmail } from "../services/emailService.js";

// Create Complaint with Image Upload + Email
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      grievance_type_id,
    } = req.body;

    const student_id = req.user.id;

    const image = req.file ? req.file.filename : null;

    const [result] = await db.execute(
      `INSERT INTO complaints
      (
        student_id,
        title,
        description,
        category,
        priority,
        grievance_type_id,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        title,
        description,
        category,
        priority,
        grievance_type_id || null,
        image,
      ]
    );

    // Send Email
    const [student] = await db.execute(
      "SELECT name, email FROM students WHERE id = ?",
      [student_id]
    );

    if (student.length > 0) {
      await sendEmail(
        student[0].email,
        "Complaint Registered Successfully",
        `Hello ${student[0].name},

Your complaint has been registered successfully.

Complaint ID: ${result.insertId}
Title: ${title}
Category: ${category}
Priority: ${priority}

Thank you,
College complaints system`
      );
    }

    res.status(201).json({
      success: true,
      message: "Complaint Created Successfully",
      complaintId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Complaints
export const getMyComplaints = async (req, res) => {
  try {
    const student_id = req.user.id;

    const [complaints] = await db.execute(
      `SELECT *
       FROM complaints
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [student_id]
    );

    res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Complaint Status + Email
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute(
      `UPDATE complaints
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    const [complaint] = await db.execute(
      `SELECT c.id, s.name, s.email
       FROM complaints c
       JOIN students s
       ON c.student_id = s.id
       WHERE c.id = ?`,
      [id]
    );

    if (complaint.length > 0) {
      await sendEmail(
        complaint[0].email,
        "Complaint Status Updated",
        `Hello ${complaint[0].name},

Your complaint status has been updated.

Complaint ID: ${id}
New Status: ${status}

Thank you,
College Complaint System`
      );
    }

    res.status(200).json({
      success: true,
      message: "Complaint Status Updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Student Dashboard Stats
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN status='Resolved' THEN 1 ELSE 0 END) AS resolved
      FROM complaints
      WHERE student_id = ?
      `,
      [studentId]
    );

    res.status(200).json({
      success: true,
      dashboard: rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    await db.execute(
      `UPDATE complaints
       SET rating = ?
       WHERE id = ?`,
      [rating, id]
    );

    res.status(200).json({
      success: true,
      message: "Rating Submitted Successfully",
      rating,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};