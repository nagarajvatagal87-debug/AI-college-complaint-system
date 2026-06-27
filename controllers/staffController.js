import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/emailService.js";

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

    const username = req.user.username;

    const [staff] = await db.execute(
      "SELECT name FROM staff WHERE username = ?",
      [username]
    );

    const staffName = staff[0].name;

    const [complaints] = await db.execute(
      `
      SELECT
    c.id,
    c.title,
    c.description,
    c.priority,
    c.status,
    c.staff_remark,
    c.assigned_to,
    c.created_at,
    c.assigned_at,
    c.updated_at,
    c.resolved_at,
    s.name AS student_name,
    s.email
      FROM complaints c
      JOIN students s
      ON c.student_id = s.id
      WHERE c.assigned_to = ?
      ORDER BY c.id DESC
      `,
      [staffName]
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
export const updateComplaintStatusByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staff_remark } = req.body;

    // Update complaint
   if (status === "Resolved") {
  await db.execute(
    `
    UPDATE complaints
    SET
      status = ?,
      staff_remark = ?,
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE id = ?
    `,
    [status, staff_remark, id]
  );
} else {
  await db.execute(
    `
    UPDATE complaints
    SET
      status = ?,
      staff_remark = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [status, staff_remark, id]
  );
}

    // Get student details
    const [complaint] = await db.execute(
      `
      SELECT
        c.title,
        c.assigned_to,
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
  `
<div style="background:#eef3f8;padding:30px;font-family:Arial,sans-serif;">

<div style="max-width:750px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.15);">

<div style="background:#1565C0;color:white;padding:25px;text-align:center;">
<h1>🎓 CampusVoice AI</h1>
<p>College Complaint Redressal System</p>
</div>

<div style="padding:30px;">

<h2>Complaint Status Updated</h2>

<p>Hello <b>${complaint[0].name}</b>,</p>

<p>Your complaint has been updated successfully by the assigned staff.</p>

<table width="100%" cellpadding="12" style="border-collapse:collapse;border:1px solid #ddd;">

<tr>
<td><b>Complaint Title</b></td>
<td>${complaint[0].title}</td>
</tr>

<tr>
<td><b>Assigned Staff</b></td>
<td>${complaint[0].assigned_to}</td>
</tr>

<tr>
<td><b>Status</b></td>
<td>${status}</td>
</tr>

</table>

<br>

<div style="background:#f8f9fa;border-left:6px solid #1565C0;padding:18px;border-radius:8px;">
<h3>📝 Staff Remark</h3>
<p>${staff_remark || "No Remark Provided"}</p>
</div>

</div>

<div style="background:#1565C0;color:white;text-align:center;padding:20px;">
Thank you for using CampusVoice AI
</div>

</div>

</div>
`
);
    }

    // Remove notification after resolving
    if (status === "Resolved") {
      await db.execute(
        `
        DELETE FROM notifications
        WHERE message LIKE ?
        `,
        [`%Complaint #${id}%`]
      );
    }

    res.status(200).json({
      success: true,
      message: "Status Updated Successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getNotifications = async (
  req,
  res
) => {
  try {

    const [staff] = await db.execute(
      "SELECT name FROM staff WHERE username=?",
      [req.user.username]
    );

    const staffName = staff[0].name;

    const [notifications] =
      await db.execute(
        `
        SELECT *
        FROM notifications
        WHERE staff_name=?
        ORDER BY id DESC
        `,
        [staffName]
      );

    res.json({
      success: true,
      notifications,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};