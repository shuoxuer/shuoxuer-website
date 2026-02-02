"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Minimize2, Maximize2, Loader2 } from "lucide-react";
import axios from "axios";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是你的羽毛球 AI 随身助教。有什么关于技术、战术或装备的问题都可以问我哦！🏸",
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get context from localStorage if available (Video Studio saves analysis there usually)
      // For now we just send the message
      const response = await axios.post("/api/v1/chat", {
        message: userMsg.content,
        // context: JSON.parse(localStorage.getItem("latestAnalysis") || "null") 
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "抱歉，我暂时无法连接到大脑。请稍后再试。",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#ccff00] hover:bg-[#b3e600] text-black rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          咨询助教
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-gray-900 border border-gray-700 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col
        ${isMinimized 
          ? "bottom-6 right-6 w-72 h-14 rounded-full" 
          : "bottom-6 right-6 w-[350px] h-[500px] rounded-2xl"
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer" onClick={() => !isMinimized && setIsMinimized(true)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI 随身助教</h3>
            {!isMinimized && <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/> Online</p>}
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/95">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                  ${msg.role === "user" ? "bg-gray-700" : "bg-[#ccff00]/20"}`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#ccff00]" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-gray-800 text-white rounded-tr-none"
                      : "bg-gray-800/50 text-gray-300 rounded-tl-none border border-gray-700"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ccff00]/20 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#ccff00]" />
                </div>
                <div className="bg-gray-800/50 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#ccff00] animate-spin" />
                  <span className="text-xs text-gray-400">思考中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-gray-800 border-t border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="问问助教..."
                className="w-full bg-gray-900 text-white text-sm rounded-xl pl-4 pr-10 py-3 border border-gray-700 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#ccff00] text-black rounded-lg hover:bg-[#b3e600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
