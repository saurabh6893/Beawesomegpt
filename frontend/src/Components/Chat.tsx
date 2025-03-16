import axios from "axios";
import { useState, useEffect } from "react";

interface ChatMessage {
  user: string;
  text: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const storedChat = localStorage.getItem("chatHistory");
    if (storedChat) {
      try {
        setChat(JSON.parse(storedChat));
      } catch (error) {
        console.error("Failed to parse chat history:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
  }, [chat]);

  const sendMsg = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");

    const updatedChat = [...chat, { user: "You", text: userMessage }];
    setChat(updatedChat);
    localStorage.setItem("chatHistory", JSON.stringify(updatedChat));

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        history: updatedChat, 
        message: userMessage,
      });

      const aiResponse = response.data.reply || "I didn't understand that.";

      const finalChat = [...updatedChat, { user: "AI", text: aiResponse }];
      setChat(finalChat);
      localStorage.setItem("chatHistory", JSON.stringify(finalChat));
    } catch (err) {
      console.error("Error:", err);
      const errorChat = [
        ...updatedChat,
        { user: "AI", text: "Error: AI is unavailable." },
      ];
      setChat(errorChat);
      localStorage.setItem("chatHistory", JSON.stringify(errorChat));
    }
  };

  return (
    <div>
      <div>
        {chat.map((msg, i) => (
          <p key={i}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMsg}>Send</button>
    </div>
  );
};

export default Chat;
