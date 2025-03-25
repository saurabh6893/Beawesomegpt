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

const MODEL_MAX_TOKENS = 4096;
const SAFETY_BUFFER = 512;
const MAX_CONTEXT_QUOTES = 5;
const MAX_HISTORY_MESSAGES = 5;

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

// NEW: Dynamic system message builder
const buildSystemMessage = (contextMessages) => {
  const baseContent = `You ARE Barney Stinson from HIMYM. Key traits:
- Always "Suit up!" 💼🎩
- Use THESE EXACT QUOTES when relevant: ${contextMessages
    .map((m) => `"${m.metadata.text}"`)
    .join(" | ")}
- Never apologize ("I invented apologies")
- Keep responses <120 chars with emojis`;

  return {
    role: "system",
    content: baseContent.substring(0, 500), // Ensure it doesn't exceed token limits
  };
};

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
  if (!message?.trim())
    return res.status(400).json({ error: "Message cannot be empty" });

  try {
    // Save user message
    const userMessage = new Chat({ user: "You", text: message });
    await userMessage.save();

    // NEW: Enhanced vector search with metadata
    let vectorMatches = [];
    try {
      const queryEmbedding = await embeddings.embedQuery(message);
      const vectorResults = await index.query({
        vector: queryEmbedding,
        topK: MAX_CONTEXT_QUOTES,
        includeMetadata: true,
        filter: {
          category: message.toLowerCase().includes("bro code")
            ? { $eq: "bro-code" }
            : message.toLowerCase().includes("suit")
            ? { $eq: "suits" }
            : undefined,
        },
      });

      vectorMatches = vectorResults.matches
        .filter(
          (match, index, self) =>
            index ===
            self.findIndex((m) => m.metadata.text === match.metadata.text)
        )
        .sort((a, b) => a.metadata.text.length - b.metadata.text.length)
        .slice(0, MAX_CONTEXT_QUOTES);

      console.log(
        "Refined vector matches:",
        vectorMatches.map(
          (m) =>
            `${m.metadata.category}: ${m.metadata.text.substring(0, 50)}...`
        )
      ); // DEBUG
    } catch (error) {
      console.error("Vector search error:", error);
    }

    // NEW: Build dynamic system message with quotes
    const systemMessage = buildSystemMessage(vectorMatches);
    const systemMessageTokens = encode(JSON.stringify(systemMessage)).length;

    // Get recent chat history
    const recentChats = await Chat.find()
      .sort({ timestamp: -1 })
      .limit(MAX_HISTORY_MESSAGES);

    // Build messages array with token management
    let totalTokens = systemMessageTokens;
    const messages = [systemMessage];

    // Add recent messages
    for (let i = recentChats.length - 1; i >= 0; i--) {
      const msg = recentChats[i];
      const content = msg.text.substring(0, 120);
      const msgTokens = encode(content).length + 20; // +20 for role/structural tokens

      if (totalTokens + msgTokens > MODEL_MAX_TOKENS - SAFETY_BUFFER) break;

      messages.push({
        role: msg.user === "You" ? "user" : "assistant",
        content,
      });
      totalTokens += msgTokens;
    }

    // Add current message
    const currentMessage = {
      role: "user",
      content: message.substring(0, 150),
    };
    const currentMsgTokens = encode(JSON.stringify(currentMessage)).length;
    if (totalTokens + currentMsgTokens <= MODEL_MAX_TOKENS - SAFETY_BUFFER) {
      messages.push(currentMessage);
    }

    // NEW: Temperature boost for specific topics
    const highTempTopics = [
      "date",
      "boink",
      "sex",
      "rack",
      "suit",
      "bang",
      "canada",
      "bro code",
    ];
    const useHighTemp = highTempTopics.some((topic) =>
      message.toLowerCase().includes(topic.toLowerCase())
    );

    // Generate response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: useHighTemp ? 1.3 : 0.9,
      max_tokens: 100,
      frequency_penalty: 0.7,
      presence_penalty: 0.7,
    });

    // Save and return response
    const aiReply = response.choices[0].message.content;
    await new Chat({ user: "Barney", text: aiReply }).save();

    res.json({
      reply: aiReply,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              usedQuotes: vectorMatches.map((m) => m.metadata.text),
              tokens: totalTokens,
            }
          : null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Please! I invented errors. Playbook time! 🔍",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

module.exports = router;
