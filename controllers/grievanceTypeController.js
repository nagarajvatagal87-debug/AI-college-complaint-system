import { db } from "../config/db.js";

// Create Grievance Type
export const createGrievanceType = async (req, res) => {
  try {
    const { name } = req.body;

    const [result] = await db.execute(
      "INSERT INTO grievance_types(name) VALUES(?)",
      [name]
    );

    res.status(201).json({
      success: true,
      message: "Grievance Type Created Successfully",
      grievanceTypeId: result.insertId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Grievance Types
export const getAllGrievanceTypes = async (req, res) => {
  try {
    const [types] = await db.execute(
      "SELECT * FROM grievance_types ORDER BY name"
    );

    res.status(200).json({
      success: true,
      types,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};