const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const OpenAI = require("openai");
const router = express.Router();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", router);

const PORT = process.env.PORT || 5000;

// ✅ Initialize OpenAI correctly
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB Error:", err));

router.post("/chat", async (req, res) => {
  const { history, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
   
    const conversation = history.map((msg) => ({
      role: msg.user === "You" ? "user" : "assistant",
      content: msg.text,
    }));

    conversation.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation, 
      temperature: 0.7,
    });

    const aiReply = response.choices[0]?.message?.content || "I didn't understand that.";

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "AI service unavailable" });
  }
});


app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
