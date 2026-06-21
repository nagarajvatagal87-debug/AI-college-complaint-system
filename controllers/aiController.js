import { analyzeComplaint } from "../services/openRouterService.js";

export const analyzeComplaintAI = async (req, res) => {
  try {
    const { complaint } = req.body;

    if (!complaint) {
      return res.status(400).json({
        success: false,
        message: "Complaint text is required",
      });
    }

    const analysis = await analyzeComplaint(complaint);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};