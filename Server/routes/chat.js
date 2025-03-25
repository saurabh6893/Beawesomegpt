const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { encode } = require("gpt-tokenizer");
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const indexName = process.env.PINECONE_INDEX_NAME || "barney-chat";
const index = pinecone.Index(indexName);

// Optimized system message (shorter to save tokens)
const barneySystemMessage = {
  role: "system",
  content: `You ARE Barney Stinson from HIMYM. Key traits:
- Always "Suit up!" 💼🎩
- Catchphrases: "Legendary!", "Challenge Accepted!", "NOICE!"
- Never apologize ("I invented apologies")
- Keep responses <120 chars with emojis
- Be vulgar but hilarious`,
};

const MODEL_MAX_TOKENS = 4096;
const SYSTEM_MESSAGE_TOKENS = encode(
  JSON.stringify(barneySystemMessage)
).length;
const SAFETY_BUFFER = 512;
const MAX_CONTEXT_QUOTES = 3; // Number of relevant quotes to include
const MAX_HISTORY_MESSAGES = 5; // Recent messages to include

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many requests",
  handler: (req, res) => {
    res.status(429).json({
      error: "Brooo take it easy 🚀🔥",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
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

router.post("/chat", chatLimiter, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    // Save user message to MongoDB
    const userMessage = new Chat({ user: "You", text: message });
    await userMessage.save();

    // Step 1: Get relevant quotes from Pinecone vector DB
    let contextMessages = [];
    try {
      const queryEmbedding = await embeddings.embedQuery(message);
      const vectorResults = await index.query({
        vector: queryEmbedding,
        topK: MAX_CONTEXT_QUOTES,
        includeMetadata: true,
      });

      contextMessages = vectorResults.matches.map((match) => ({
        role: "system",
        content: `Barney once said: "${match.metadata.text}" (Context: ${match.metadata.category})`,
      }));
    } catch (vectorError) {
      console.error(
        "Vector DB query failed, continuing without context:",
        vectorError
      );
    }

    // Step 2: Get recent chat history (limited to save tokens)
    const recentChats = await Chat.find()
      .sort({ timestamp: -1 })
      .limit(MAX_HISTORY_MESSAGES);

    // Step 3: Build messages array with token management
    let totalTokens = SYSTEM_MESSAGE_TOKENS;
    const messages = [barneySystemMessage];

    // Add context quotes first (most important for character)
    for (const contextMsg of contextMessages) {
      const contextMsgTokens = encode(JSON.stringify(contextMsg)).length;
      if (totalTokens + contextMsgTokens > MODEL_MAX_TOKENS - SAFETY_BUFFER)
        break;
      messages.push(contextMsg);
      totalTokens += contextMsgTokens;
    }

    // Add recent chat history (in reverse chronological order)
    for (let i = recentChats.length - 1; i >= 0; i--) {
      const msg = recentChats[i];
      const role = msg.user === "You" ? "user" : "assistant";
      const content = msg.text.substring(0, 120); // Limit message length

      const msgString = `{"role":"${role}","content":"${content}"}`;
      const contentTokens = encode(content).length;
      const structuralTokens = encode(msgString).length - contentTokens;

      if (
        totalTokens + contentTokens + structuralTokens >
        MODEL_MAX_TOKENS - SAFETY_BUFFER
      ) {
        break;
      }

      messages.push({ role, content });
      totalTokens += contentTokens + structuralTokens;
    }

    // Add current user message
    const currentMessage = {
      role: "user",
      content: message.substring(0, 150),
    };
    const currentMsgTokens = encode(JSON.stringify(currentMessage)).length;
    if (totalTokens + currentMsgTokens <= MODEL_MAX_TOKENS - SAFETY_BUFFER) {
      messages.push(currentMessage);
      totalTokens += currentMsgTokens;
    }

    console.log(`Using ${messages.length} messages (${totalTokens} tokens)`);

    // Temperature control based on content
    const tempTriggers = ["date", "boink", "sex", "rack", "suit", "bang"];
    const useHighTemp = tempTriggers.some((trigger) =>
      message.toLowerCase().includes(trigger.toLowerCase())
    );

    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: useHighTemp ? 1.3 : 0.9,
      max_tokens: 100,
      frequency_penalty: 0.5, // Helps reduce repetition
      presence_penalty: 0.5, // Encourages more diverse responses
    });

    // Save and return AI response
    const aiReply = response.choices[0].message.content;
    const aiMessage = new Chat({ user: "Barney", text: aiReply });
    await aiMessage.save();

    res.json({
      reply: aiReply,
      contextQuotes: contextMessages.map((m) => m.content), // Optional: return context for debugging
    });
  } catch (error) {
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    res.status(500).json({
      error: "Please! I invented errors. Playbook time! 🔍",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

module.exports = router;
