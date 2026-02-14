"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import clsx from "clsx";
import axios from "axios";
import { useRouter } from "next/navigation";

export function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
      const loadHistory = async () => {
          try {
              const res = await axios.get("/api/v1/sessions");
              setHistory(res.data);
          } catch (e) {
              console.error("Failed to load chat history:", e);
          }
      };
      loadHistory();
      
      // Listen for updates
      window.addEventListener('chat-history-updated', loadHistory);
      return () => window.removeEventListener('chat-history-updated', loadHistory);
  }, []);

  const handleNewChat = () => {
      router.push('/chat');
      // Force reload or state clear if needed, but router push usually handles navigation
      // We might need to clear query params
      window.location.href = '/chat';
  };

  const handleSelectSession = (id: string) => {
      router.push(`/chat?id=${id}`);
  };

  return (
    <div 
      className={clsx(
        "flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
            onClick={handleNewChat}
            className="flex items-center space-x-2 text-slate-200 hover:bg-slate-800 rounded-lg px-2 py-2 w-full transition"
        >
            <div className="bg-white text-black p-1 rounded-full">
                <Plus className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">新对话</span>
        </button>
        <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-white p-2"
        >
            <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-2">
          <div className="px-2 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">历史对话</div>
          {history.length > 0 ? (
              history.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => handleSelectSession(item.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center truncate group"
                  >
                      <MessageSquare className="w-4 h-4 mr-2 shrink-0 group-hover:text-yellow-400" />
                      <span className="truncate">{item.title || "未命名对话"}</span>
                  </button>
              ))
          ) : (
              <div className="px-3 py-2 text-sm text-slate-500">暂无历史记录</div>
          )}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500"></div>
              <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">羽球运动员</p>
                  <p className="text-xs text-slate-500 truncate">专业会员</p>
              </div>
          </div>
      </div>
    </div>
  );
}

export function SidebarTrigger({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
    if (isOpen) return null;
    return (
        <button 
            onClick={toggle}
            className="absolute top-4 left-4 z-50 text-slate-400 hover:text-white bg-slate-900/50 p-2 rounded-lg"
        >
            <PanelLeftOpen className="w-5 h-5" />
        </button>
    );
}
