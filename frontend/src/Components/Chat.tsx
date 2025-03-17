import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";

interface ChatMessage {
  user: string;
  text: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch chat history from MongoDB when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/chat/history");
        setChat(response.data); // ✅ Store fetched chat history
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    fetchChatHistory();
  }, []);

  // ✅ Animate chat messages & auto-scroll
  useEffect(() => {
    gsap.fromTo(
      ".chat-bubble",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
    );
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  // ✅ Function to send messages
  const sendMsg = async () => {
    if (!message.trim()) return;
    const userMessage = message.trim();
    setMessage("");

    const updatedChat = [...chat, { user: "You", text: userMessage }];
    setChat(updatedChat);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        history: updatedChat,
        message: userMessage,
      });
      const aiResponse = response.data.reply || "I didn't understand that.";
      setChat([...updatedChat, { user: "AI", text: aiResponse }]);
    } catch (err) {
      console.error("Error:", err);
      setChat([...updatedChat, { user: "AI", text: "Error: AI is unavailable." }]);
    }
  };

  // ✅ Function to clear chat
  const clearChat = async () => {
    try {
      await axios.delete("http://localhost:5000/api/chat/clear"); // ✅ Call backend API
      setChat([]); // ✅ Clear chat state
      localStorage.removeItem("chatHistory"); // ✅ Clear local storage (if used)
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box" ref={chatContainerRef}>
        {chat.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.user === "You" ? "user" : "ai"}`}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          className="chat-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="chat-send-button" onClick={sendMsg}>
          Send
        </button>
        <button className="chat-clear-button" onClick={clearChat}>
          Clear Chat
        </button>
      </div>
    </div>
  );
};

export default Chat;
