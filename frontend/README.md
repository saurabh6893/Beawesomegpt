# AI-Powered Character Chat Application

A full-stack chatbot mimicking Barney Stinson from *How I Met Your Mother*, featuring contextual responses powered by OpenAI GPT-3.5 and vector search capabilities with Pinecone.

## Features

- Dynamic character persona (Barney Stinson personality traits)
- Context-aware responses using OpenAI GPT-3.5 + Pinecone vector search
- Real-time chat animations with GSAP
- Rate-limited API endpoints (Express)
- MongoDB chat history persistence
- Responsive UI with dynamic routing

## Tech Stack

**Frontend:** React, TypeScript, GSAP  
**Backend:** Node.js, Express, MongoDB  
**AI Services:** OpenAI GPT-3.5, Pinecone  
**Tools:** Axios, React Router, Playwright (testing)

## Setup Instructions

### Prerequisites
- OpenAI API key
- Pinecone API key & index named `barney-chat`
- MongoDB instance (local or Atlas)

1. **Clone Repository**
Install Dependencies
cd client && npm install
cd ../server && npm install

2 **Environment Variables (server/.env)**
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
MONGO_URL=your_mongodb_uri
PORT=5000

3 **CORS Configuration**
Ensure client/src/App.tsx matches your frontend URL (default: http://localhost:5173)

Backend:
cd server && npm start

Frontend:
cd client && npm run dev
