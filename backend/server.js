const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 🔥 fetch fix (Node compatibility)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 HEALTH CHECK (optional but useful)
app.get("/", (req, res) => {
  res.send("CodeGuru Backend Running 🚀");
});

// 🔥 MAIN API ROUTE
app.post("/api/chat", async (req, res) => {
  const { message, language } = req.body;

  if (!message) {
    return res.json({ reply: "Please enter a message" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a coding AI assistant. Answer in ${language}. Provide code inside triple backticks and explanation.\n\nUser: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // 🔥 API error handling
    if (!response.ok) {
      return res.json({
        reply: data?.error?.message || "Gemini API error",
      });
    }

    // 🔥 Safe response extraction
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    res.json({ reply });

  } catch (error) {
    res.json({
      reply: "Server error: " + error.message,
    });
  }
});

// 🔥 PORT (Render compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});