

import axios from "axios";

export const analyzeComplaint = async (complaintText) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `
You are a college grievance classification assistant.

Analyze this complaint and return ONLY valid JSON.

Complaint:
"${complaintText}"

Response Format:
{
  "improvedComplaint": "",
  "category": "",
  "priority": "",
  "summary": "",
  "sentiment": ""
}

Categories:
Hostel
Transport
Infrastructure
Faculty
Library
Examination

Priority:
Low
Medium
High

Sentiment:
Positive
Neutral
Negative
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result =
      response.data.choices[0].message.content;

    return JSON.parse(result);
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};