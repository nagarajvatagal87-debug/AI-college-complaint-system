import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Staff
export const registerStaff = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      grievance_type_id,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO staff
      (name, username, email, password, grievance_type_id)
      VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        username,
        email,
        hashedPassword,
        grievance_type_id,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Staff Registered Successfully",
      staffId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Staff Login
export const loginStaff = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [staff] = await db.execute(
      "SELECT * FROM staff WHERE username = ?",
      [username]
    );

    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      staff[0].password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: staff[0].id,
        username: staff[0].username,
        role: "staff",
        grievance_type_id: staff[0].grievance_type_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      staff: {
        id: staff[0].id,
        name: staff[0].name,
        username: staff[0].username,
        email: staff[0].email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// View Assigned Complaints
export const getAssignedComplaints = async (req, res) => {
  try {
    const grievanceTypeId = req.user.grievance_type_id;

    const [complaints] = await db.execute(
      `SELECT
          c.id,
          c.title,
          c.description,
          c.priority,
          c.status,
          c.created_at,
          s.name AS student_name,
          s.email
       FROM complaints c
       JOIN students s
       ON c.student_id = s.id
       WHERE c.grievance_type_id = ?`,
      [grievanceTypeId]
    );

    res.status(200).json({
      success: true,
      count: complaints.length,
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