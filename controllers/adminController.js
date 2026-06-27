import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/emailService.js";
// Dashboard Statistics
export const getAdminDashboard = async (req, res) => {
  try {
    const [[students]] = await db.execute(
      "SELECT COUNT(*) AS totalStudents FROM students"
    );

    const [[staff]] = await db.execute(
      "SELECT COUNT(*) AS totalStaff FROM staff"
    );

    const [[complaints]] = await db.execute(
      "SELECT COUNT(*) AS totalComplaints FROM complaints"
    );

    const [[pending]] = await db.execute(
      "SELECT COUNT(*) AS pendingComplaints FROM complaints WHERE status='Pending'"
    );

    const [[resolved]] = await db.execute(
      "SELECT COUNT(*) AS resolvedComplaints FROM complaints WHERE status='Resolved'"
    );

    res.status(200).json({
      success: true,
      dashboard: {
        totalStudents: students.totalStudents,
        totalStaff: staff.totalStaff,
        totalComplaints: complaints.totalComplaints,
        pendingComplaints: pending.pendingComplaints,
        resolvedComplaints: resolved.resolvedComplaints,
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

// Get All Complaints
export const getAllComplaints = async (req, res) => {
  try {
    const [complaints] = await db.execute(`
      SELECT
    c.id,
    s.name AS student_name,
    c.title,
    c.category,
    c.priority,
    c.status,
    c.assigned_to,
    c.created_at
      FROM complaints c
      JOIN students s
      ON c.student_id = s.id
      ORDER BY c.created_at DESC
    `);

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

// Complaints By Category
export const complaintsByCategory = async (req, res) => {
  try {
    const [data] = await db.execute(`
      SELECT
        category,
        COUNT(*) AS count
      FROM complaints
      GROUP BY category
    `);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Complaints By Status
export const complaintsByStatus = async (req, res) => {
  try {
    const [data] = await db.execute(`
      SELECT
        status,
        COUNT(*) AS count
      FROM complaints
      GROUP BY status
    `);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// High Priority Complaints
export const highPriorityComplaints = async (req, res) => {
  try {
    const [complaints] = await db.execute(`
      SELECT *
      FROM complaints
      WHERE priority = 'High'
      ORDER BY created_at DESC
    `);

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
      `
      SELECT
        c.title,
        s.name,
        s.email
      FROM complaints c
      JOIN students s
      ON c.student_id = s.id
      WHERE c.id = ?
      `,
      [id]
    );
    

    if (complaint.length > 0) {
      await sendEmail(
        complaint[0].email,
        "Complaint Status Updated",
        `Hello ${complaint[0].name},

Your complaint status has been updated.

Complaint Title: ${complaint[0].title}
Current Status: ${status}

Thank you,
CampusVoice Team`
      );
    }

    res.status(200).json({
      success: true,
      message: "Status Updated Successfully",
    });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const [complaints] = await db.execute(
      `
      SELECT
c.*,

s.name AS student_name,
s.email,

st.email AS staff_email,
st.name AS staff_name,

a.username AS admin_name

FROM complaints c

JOIN students s
ON c.student_id=s.id

LEFT JOIN staff st
ON c.assigned_to=st.name

LEFT JOIN admin a
ON a.id=1

WHERE c.id=?
      `,
      [id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      complaint: complaints[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [admin] = await db.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    if (admin.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin[0].password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: admin[0].id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin[0].id,
        username: admin[0].username,
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
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    await db.execute(
      `
      UPDATE complaints
SET assigned_to=?,
assigned_at=NOW()
WHERE id=?
      `,
      [assigned_to, id]
    );

    await db.execute(
  `
  INSERT INTO notifications
  (staff_name, message)
  VALUES (?, ?)
  `,
  [
    assigned_to,
    `Complaint #${id} assigned to you at ${new Date().toLocaleTimeString()}`
  ]
);

    res.status(200).json({
      success: true,
      message: "Complaint Assigned Successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};