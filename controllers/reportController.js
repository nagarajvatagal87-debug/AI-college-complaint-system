import PDFDocument from "pdfkit";
import { db } from "../config/db.js";

export const downloadReport = async (req, res) => {
  try {
    const [complaints] = await db.execute(
      `SELECT id, title, category, priority, status, rating
       FROM complaints
       ORDER BY created_at DESC`
    );

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Complaint_Report.pdf"
    );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text(
      "College Complaint Report",
      {
        align: "center",
      }
    );

    doc.moveDown();

    complaints.forEach((c, index) => {
  doc.fontSize(14).text(`Complaint #${index + 1}`);

  doc.moveDown();

  doc.text(`ID: ${c.id}`);
  doc.text(`Title: ${c.title}`);
  doc.text(`Category: ${c.category}`);
  doc.text(`Priority: ${c.priority}`);
  doc.text(`Status: ${c.status}`);
  doc.text(`Rating: ${c.rating || "N/A"}`);

  doc.moveDown();

  doc.text("----------------------------------------");

  doc.moveDown();
});

    doc.end();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};