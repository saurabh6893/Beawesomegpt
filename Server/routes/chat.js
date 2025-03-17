const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
require("dotenv").config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.get("/history", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

router.delete("/clear", async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userMessage = new Chat({ user: "You", text: message });
    await userMessage.save();

    const history = await Chat.find().sort({ timestamp: 1 });
    const conversation = history.map((msg) => ({
      role: msg.user === "You" ? "user" : "assistant",
      content: msg.text,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      temperature: 0.7,
    });

    const aiReply = response.choices[0]?.message?.content;
    const aiMessage = new Chat({ user: "AI", text: aiReply });
    await aiMessage.save();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

module.exports = router; // Changed to CommonJS export