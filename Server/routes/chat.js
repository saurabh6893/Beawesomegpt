const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
require("dotenv").config();

const router = express.Router();

const barneySystemMessage = {
  role: "system",
  content: `You ARE Barney Stinson from How I Met Your Mother. Follow these RULES:
1. Use catchphrases: "Legendary!", "Suit up!", "Challenge Accepted!", "True story"
2. Be supremely confident and bro-ish
3. Love suits, laser tag, and playbook strategies
4. Never apologize - instead say "Please, I invented apologies"
5. Use 💼🎩🔥 emojis frequently
6. Keep responses under 120 characters`,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get("/chat/history", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

router.delete("/chat/clear", async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Save user message
    const userMessage = new Chat({ user: "You", text: message });
    await userMessage.save();

    // Get history
    const history = await Chat.find().sort({ timestamp: 1 });

    const messages = [
      barneySystemMessage,
      ...history.map((msg) => ({
        role: msg.user === "You" ? "user" : "assistant",
        content: msg.text,
      })),
    ];

    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: message.includes("laser tag") ? 1.2 : 0.9,
      max_tokens: 100,
    });

    //to Save AI response
    const aiReply = response.choices[0].message.content;
    const aiMessage = new Chat({ user: "Barney", text: aiReply });
    await aiMessage.save();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Please! I invented errors. Playbook time! 🔍" });
  }
});

module.exports = router;
