import express from "express";
import OpenAI from "openai"; // Ensure you have `openai` installed
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export default router;
