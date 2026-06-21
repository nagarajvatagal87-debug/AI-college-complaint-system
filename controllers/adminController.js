import { db } from "../config/db.js";

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