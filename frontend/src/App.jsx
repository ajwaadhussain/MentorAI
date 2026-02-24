import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useState, useEffect, useRef } from "react";
import { User, FileText, Mic, Send, Trash2, Plus, PanelLeftClose } from "lucide-react";
import axios from "axios"; // Ensure axios is imported for direct calls
import "./App.css";
import { uploadFile, chatWithAI } from "./api"; 

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // New state for sidebar
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- FETCH FILES FROM BACKEND ---
  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/files");
      setUploadedFiles(res.data.files);
    } catch (e) {
      console.error("Could not fetch files from backend");
    }
  };

  // Fetch file list when the app starts
  useEffect(() => {
    const fetchInitialFiles = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/files");
        setUploadedFiles(res.data.files);
      } catch (e) {
        console.error("Sidebar sync failed");
      }
    };
    fetchInitialFiles();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  const handleStart = (e) => {
    if (e.key === "Enter" && name.trim()) setHasStarted(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsTyping(true);
    setMessages(prev => [...prev, { role: "user", text: `Uploading ${file.name}...` }]);

    try {
      await uploadFile(file);
      await fetchFiles(); // Refresh sidebar after successful upload
      setMessages(prev => [...prev, { 
        role: "bot", 
        type: "text",
        text: `✅ I have read **${file.name}**. You can now ask me questions about it!`,
        source: "System"
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        type: "text",
        text: "❌ Failed to read the file. Please try a text-based PDF." 
      }]);
    }
    setIsTyping(false);
  };

  // --- DELETE ALL FILES ---
  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to clear all documents? This will reset your AI's memory.")) {
      try {
        await axios.delete("http://127.0.0.1:8000/files");
        setUploadedFiles([]); // Clear sidebar
        setMessages(prev => [...prev, { role: "bot", text: "🗑️ All documents have been deleted. Memory reset." }]);
      } catch (e) {
        alert("Failed to delete files.");
      }
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", text: text }]);
    setInput("");
    setIsTyping(true);

    try {
      const responseData = await chatWithAI(text);
      const aiText = responseData.answer || responseData; 

      setMessages(prev => [...prev, { 
        role: "bot", 
        type: "text",
        text: aiText, 
        source: "MentorAI Brain"
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        type: "text",
        text: "⚠️ I couldn't connect to the server. Is the backend running?" 
      }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="app-container">
      <aside className={`sidebar ${hasStarted ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="logo-text-sidebar">MentorAI.</span>
          <PanelLeftClose size={20} className="icon-black" onClick={() => setHasStarted(false)}/>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileUpload} 
          accept=".pdf"
        />
        
        <button className="add-btn" onClick={() => fileInputRef.current.click()}>
          <Plus size={18} color="black" /> <span style={{color: "black"}}>Add PDF</span>
        </button>

        <div className="history-list">
          <div className="history-header">
            <span className="section-title">Documents</span>
            {uploadedFiles.length > 0 && (
              <Trash2 size={16} className="delete-icon" onClick={handleDeleteAll} />
            )}
          </div>
          
          {uploadedFiles.length === 0 ? (
            <p className="empty-msg">No files uploaded</p>
          ) : (
            uploadedFiles.map((filename, index) => (
              <div key={index} className="history-item">
                <div className="file-icon"><FileText size={14} /></div>
                <span className="file-name">{filename}</span>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <div className="logo-brand">
            Mentor<span className="text-green">AI.</span>
          </div>
          <div className="avatar-circle"><User size={20} /></div>
        </header>

        <div className="center-stage">
          {!hasStarted ? (
            <div className="welcome-box">
              <h1 className="hero-title">
                Mentor<span className="text-green">AI.</span>
              </h1>
              <input 
                type="text" 
                className="glass-input-name"
                placeholder="Enter your Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleStart}
                autoFocus
              />
            </div>
          ) : (
            <div className={`chat-interface ${messages.length === 0 ? "centered" : ""}`}>
              {messages.length === 0 ? (
                 <h1 className="hero-title fade-in">
                    Hi <span className="text-green">{name}</span>
                 </h1>
              ) : (
                <div className="messages-scroll">
                  {messages.map((msg, i) => (
                    <div key={i} className={`message-wrapper ${msg.role}`}>
                      <div className="bubble-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {String(msg.text)} 
                        </ReactMarkdown>
  
                        {msg.role === "bot" && msg.source && (
                          <div className="citation">
                            <FileText size={12} /> Source: {msg.source}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="message-wrapper bot">
                      <div className="bubble-content thinking">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {hasStarted && (
          <div className="floating-input-container fade-in-up">
            <input 
                className="main-chat-input" 
                placeholder="What do you want to say?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                autoFocus
            />
            <div className="input-bottom-row">
              <div className="action-pills">
                <button className="pill" onClick={() => handleSend("Ask a question...")}>Ask</button>
                <button className="pill" onClick={() => handleSend("Summarize this document")}>Summarize</button>
                <button className="pill" onClick={() => handleSend("Create a Quiz from this")}>Quiz</button>
              </div>
              <div className="controls">
                 <Mic size={22} className="icon-btn" />
                 <Send size={22} className="icon-btn" onClick={() => handleSend()} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}