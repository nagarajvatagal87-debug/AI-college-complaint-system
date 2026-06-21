import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Student
export const registerStudent = async (req, res) => {
  try {
    const { name, username, email, password, mobile } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO students
      (name, username, email, password, mobile)
      VALUES (?, ?, ?, ?, ?)`,
      [name, username, email, hashedPassword, mobile]
    );

    res.status(201).json({
      success: true,
      message: "Student Registered Successfully",
      studentId: result.insertId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login Student
export const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [student] = await db.execute(
      "SELECT * FROM students WHERE username = ?",
      [username]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      student[0].password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: student[0].id,
        username: student[0].username,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      student: {
        id: student[0].id,
        name: student[0].name,
        username: student[0].username,
        email: student[0].email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};