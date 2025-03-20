import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import ScrollVelocity from "./ScrollVelocity";

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
      let errorMessage = "Error: AI is unavailable.";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          errorMessage = err.response.data.error || "Slow down, legend! 🔥";
        }
      }
      setChat((prev) => [...prev, { user: "AI", text: errorMessage }]);
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
      <ScrollVelocity
        texts={[
          "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Barney Stinson reporting for Booot.....ehhm ehhm  \u00A0\u00A0\u00A0i\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 mean Dooty 💼🎩 !\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Stay Awesome 🔥\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Its going to be Legen.......wait for it\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Dary!  \u00A0\u00A0\u00A0 Legeeeendaaaaary!\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
        ]}
        velocity={300}
        className="custom-scroll-text"
      />
    </div>
  );
};

export default Chat;
