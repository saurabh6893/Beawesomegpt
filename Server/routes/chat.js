const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
require("dotenv").config();

const router = express.Router();
const { encode } = require("gpt-tokenizer");

const barneySystemMessage = {
  role: "system",
  content: `Be Barney Stinson (HIMYM):
- Legendary! Suit-up obsessed bro w/ 💼🎩🔥 at times
- be Vulgar: "NOICE!", "Her rack's legendary!", "Challenge Accepted!"
- Never apologize ("I invented apologies")
- Fake history: "1322: Scotucus made scotch for bros"
- be Shallow: No ugly flat-chested or 30+ women ("Ancient in boink years")
- Double vulgarity when challenged
- Responses <120 chars, packed with emojis`,
};
router.use(verifyToken);
router.use(checkRateLimit);

const MODEL_MAX_TOKENS = 4096;
const SYSTEM_MESSAGE_TOKENS = encode(
  JSON.stringify(barneySystemMessage)
).length;
const SAFETY_BUFFER = 512;

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

    const fullHistory = await Chat.find().sort({ timestamp: 1 });

    let totalTokens = SYSTEM_MESSAGE_TOKENS;
    const messages = [barneySystemMessage];

    for (let i = fullHistory.length - 1; i >= 0; i--) {
      const msg = fullHistory[i];
      const role = msg.user === "You" ? "user" : "assistant";
      let content = msg.text
        .replace(/\s+/g, " ")
        .replace(/(\w)(\W)/g, "$1 $2")
        .substring(0, 120);

      const msgString = `{"role":"${role}","content":"${content}"}`;
      const contentTokens = encode(content).length;
      const structuralTokens = encode(msgString).length - contentTokens;

      if (
        totalTokens + contentTokens + structuralTokens >
        MODEL_MAX_TOKENS - SAFETY_BUFFER
      )
        break;

      messages.unshift({ role, content: msg.text });
      totalTokens += contentTokens + structuralTokens;
    }

    console.log(`Using ${messages.length} messages (${totalTokens} tokens)`);
    // Add current message
    messages.push({
      role: "user",
      content: message.substring(0, 150),
    });

    // Temperature control
    const tempTriggers = ["date", "boink", "sex", "rack", "suit", "bang"];
    const useHighTemp = tempTriggers.some((trigger) =>
      message.toLowerCase().includes(trigger.toLowerCase())
    );

    //  AI resp
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: useHighTemp ? 1.3 : 0.9,
      max_tokens: 100,
    });

    // Save AI resp
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
