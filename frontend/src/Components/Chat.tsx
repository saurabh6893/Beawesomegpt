import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";

interface ChatMessage {
  user: string;
  text: string;
  _id?: string;
  timestamp?: Date;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.set(".chat-container", {
      opacity: 1,
      immediateRender: true,
    });

    gsap.to(".chat-bubble", {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.2)",
      onComplete: () => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      },
    });
  }, [chat]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/chat/history"
        );
        setChat(response.data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    fetchChatHistory();
  }, []);

  const sendMsg = async () => {
    if (!message.trim()) return;
    const userMessage = message.trim();
    setMessage("");

    try {
      setChat((prev) => [...prev, { user: "You", text: userMessage }]);
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: userMessage,
      });
      const aiResponse = response.data.reply || "I didn't understand that.";
      setChat((prev) => [...prev, { user: "Barney", text: aiResponse }]);
    } catch (err) {
      console.error("Error:", err);
      setChat((prev) => [
        ...prev,
        { user: "AI", text: "Error: AI is unavailable." },
      ]);
    }
  };

  const clearChat = async () => {
    try {
      await axios.delete("http://localhost:5000/api/chat/clear");
      setChat([]);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box" ref={chatContainerRef}>
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.user === "You" ? "user" : "ai"}`}
          >
            <strong>{msg.user}:</strong>{" "}
            {msg.text.split(" ").map((word, wordIndex) => (
              <span key={wordIndex}>{word}</span>
            ))}
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
