# Beawesomegpt

An AI-powered chatbot that always keeps conversations legendary! Channel the persona of **Barney Stinson** from *How I Met Your Mother* with context-aware, character-driven responses powered by OpenAI GPT-3.5 and Pinecone vector search.

## 🏛️ Architecture

**Full-stack MERN** application with advanced AI integration:

- **Frontend:** React 19 + TypeScript, built with Vite  
- **Backend:** Node.js + Express.js, MongoDB (Mongoose)  
- **AI Services:**  
  - OpenAI GPT-3.5-turbo for chat completions  
  - OpenAI Embeddings (`text-embedding-ada-002`) via `@langchain/openai`  
  - Pinecone vector database (`barney-chat` index)  
- **Animations:** GSAP (chat bubbles) & Framer Motion (scrolling text)  
- **HTTP Client:** Axios  
- **Rate Limiting:** 5 requests/hour with custom Barney-style error messages  

## 📂 Project Structure

```
Beawesomegpt/
├─ Server/
│  ├─ server.js             # Express setup, CORS, MongoDB connection
│  ├─ package.json          # Backend dependencies and scripts
│  ├─ models/
│  │  └─ Chat.js            # Mongoose schema for chat messages
│  └─ routes/
│     └─ chat.js            # Chat API endpoints & AI pipeline
└─ frontend/
   ├─ src/
   │  ├─ App.tsx            # Root React component
   │  └─ Components/
   │     ├─ Chat.tsx        # Chat UI, animations, API calls
   │     └─ ScrollVelocity.tsx  # Framer Motion scrolling text
   ├─ package.json          # Frontend dependencies and scripts
   ├─ tsconfig.json         # TypeScript configuration
   └─ vite.config.ts        # Vite build configuration
```

## 🔧 Setup & Running

1. **Clone & install dependencies**  
   ```bash
   git clone https://github.com/saurabh6893/Beawesomegpt.git
   cd Beawesomegpt
   cd Server && npm install
   cd ../frontend && npm install
   ```

2. **Environment variables** (`Server/.env`):  
   ```
   OPENAI_API_KEY=your_openai_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX_NAME=barney-chat
   MONGO_URL=your_mongodb_uri
   PORT=5000
   ```

3. **Start backend**  
   ```bash
   cd Server
   npm run serve
   ```

4. **Start frontend**  
   ```bash
   cd frontend
   npm run dev
   ```

## 🚀 Features

- **Character Persona:**  
  - Always “Suit up!” 💼🎩  
  - Uses exact Barney quotes when relevant  
  - Never apologizes (“I invented apologies”)  
  - 🧩 Keeps responses under 120 chars with emojis  

- **AI & Vector Search:**  
  - OpenAI GPT-3.5-turbo chat completions  
  - Pinecone semantic search for contextual quotes  
  - LangChain Embeddings integration  

- **Context Management:**  
  - Top 5 vector-matched quotes + last 5 messages  
  - Token budget management within 4096-token model limit  
  - Custom temperature boost for topics like dating, bro code, suits  

- **Chat Experience:**  
  - Real-time messaging with optimistic updates  
  - GSAP chat bubble animations & auto-scroll  
  - Framer Motion scrolling text component  
  - Persistent chat history in MongoDB  
  - Rate limiting (5 req/hr) with themed error responses  

## ⚙️ API Endpoints

| Endpoint               | Method | Description                         |
|------------------------|--------|-------------------------------------|
| `/api/chat/history`    | GET    | Fetch full chat history             |
| `/api/chat`            | POST   | Send a message → get AI reply       |
| `/api/chat/clear`      | DELETE | Clear all chat history              |

## 📜 License

ISC License  

**Keep it legendary!** 🥂
