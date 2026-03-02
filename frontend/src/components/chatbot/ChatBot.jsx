import { useState, useRef, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const sessionId = "user-session-001";
  const chatEndRef = useRef(null);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hello! I'm your StockWise assistant. How can I help you today?"
      }]);
    }
  }, []);
  
  const sendMessage = async (messageText) => {
    const textToSend = messageText || input;
    if ((!textToSend.trim() && !messageText) || isLoading) return;
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser.id;
    const newMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);
    setShowOptions(false);
    
    try {
      const res = await axios.post("http://localhost:3000/summary/ask", {
        sessionId,
        message: textToSend,
        userId
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
      setShowOptions(true);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "⚠️ Something went wrong. Please try again." 
      }]);
      setShowOptions(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const options = [
    "Tell me about my portfolio",
    "Investment recommendations"
  ];
  
  const handleOptionClick = (option) => {
    sendMessage(option);
  };
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {!isChatOpen && (
        <button 
          className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-4 shadow d-flex justify-content-center align-items-center"
          style={{ width: "60px", height: "60px" }}
          onClick={toggleChat}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-chat-dots" viewBox="0 0 16 16">
            <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
          </svg>
        </button>
      )}
      
      {isChatOpen && (
        <div className="position-fixed bottom-0 end-0 m-4 rounded-4 shadow overflow-hidden d-flex flex-column" style={{ width: "350px", height: "500px", backgroundColor: "#fff" }}>
      <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="bg-white p-1 rounded me-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#0d6efd" className="bi bi-chat" viewBox="0 0 16 16">
              <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
            </svg>
          </div>
          <span className="fw-medium">Chatbot</span>
        </div>
        <div className="d-flex">
          <button className="btn btn-link text-white p-0 me-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-dash" viewBox="0 0 16 16">
              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
            </svg>
          </button>
          <button className="btn btn-link text-white p-0" onClick={toggleChat}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-grow-1 overflow-auto p-3 bg-white">
        <div className="d-flex flex-column gap-3">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
            >
              <div 
                className={`rounded-4 py-2 px-3 ${
                  msg.role === "user" 
                    ? "bg-primary-subtle text-primary-emphasis" 
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "85%" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="d-flex justify-content-start">
              <div className="bg-light rounded-4 py-2 px-3">
                <div className="d-flex gap-1">
                  <div className="rounded-circle bg-secondary" style={{ height: "8px", width: "8px", animation: "bounce 1s infinite" }}></div>
                  <div className="rounded-circle bg-secondary" style={{ height: "8px", width: "8px", animation: "bounce 1s infinite 0.2s" }}></div>
                  <div className="rounded-circle bg-secondary" style={{ height: "8px", width: "8px", animation: "bounce 1s infinite 0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && showOptions && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="btn btn-outline-primary rounded-pill py-1 px-3"
                  style={{ fontSize: "0.875rem" }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          
          <div ref={chatEndRef}></div>
        </div>
      </div>
      
      <div className="bg-white border-top p-3">
        <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1">
          <input
            className="form-control border-0 bg-transparent shadow-none"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`btn btn-link ${input.trim() && !isLoading ? "text-primary" : "text-secondary"}`}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
      )}
    </>
  );
}