"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, Image as ImageIcon, Video, FileText, X } from "lucide-react";
import clsx from "clsx";

interface ChatInputProps {
  onSend: (message: string, files: File[]) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!input.trim() && files.length === 0) || isLoading) return;
    onSend(input, files);
    setInput("");
    setFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    setShowAttachMenu(false);
  };

  const removeFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Specific handlers for cards
  const handleVideoUpload = () => {
      if (fileInputRef.current) {
          fileInputRef.current.accept = "video/*";
          fileInputRef.current.click();
      }
  }
  
  const handleImageUpload = () => {
      if (fileInputRef.current) {
          fileInputRef.current.accept = "image/*";
          fileInputRef.current.click();
      }
  }
  
  const handleDocUpload = () => {
      if (fileInputRef.current) {
          fileInputRef.current.accept = ".pdf,.doc,.docx,.txt";
          fileInputRef.current.click();
      }
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-4 relative">
      {/* File Previews */}
      {files.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto p-2">
              {files.map((file, i) => (
                  <div key={i} className="relative group bg-slate-800 rounded-lg p-2 border border-slate-700 min-w-[120px] flex items-center">
                      <div className="bg-slate-700 p-2 rounded mr-2">
                          {file.type.startsWith('video') ? <Video className="w-4 h-4 text-blue-400" /> :
                           file.type.startsWith('image') ? <ImageIcon className="w-4 h-4 text-pink-400" /> :
                           <FileText className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button 
                        onClick={() => removeFile(i)}
                        className="absolute -top-1 -right-1 bg-slate-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition"
                      >
                          <X className="w-3 h-3" />
                      </button>
                  </div>
              ))}
          </div>
      )}

      {/* Quick Action Cards */}
      {files.length === 0 && !input && (
        <div className="grid grid-cols-3 gap-3 mb-4">
            <button 
                onClick={handleVideoUpload}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center transition group"
            >
                <div className="bg-blue-900/30 p-2 rounded-lg mb-2 group-hover:scale-110 transition">
                    <Video className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-300">分析视频</span>
                <span className="text-[10px] text-slate-500 mt-1">上传动作视频</span>
            </button>

            <button 
                onClick={handleImageUpload}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center transition group"
            >
                <div className="bg-pink-900/30 p-2 rounded-lg mb-2 group-hover:scale-110 transition">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-xs font-bold text-slate-300">分析穿搭</span>
                <span className="text-[10px] text-slate-500 mt-1">上传 OOTD</span>
            </button>

            <button 
                onClick={handleDocUpload}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center transition group"
            >
                <div className="bg-emerald-900/30 p-2 rounded-lg mb-2 group-hover:scale-110 transition">
                    <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-300">知识库</span>
                <span className="text-[10px] text-slate-500 mt-1">上传文档资料</span>
            </button>
        </div>
      )}

      {/* Input Area */}
      <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-lg focus-within:border-slate-500 transition-colors">
        {/* Attach Menu - Removed as requested by user preference for cards */}
        {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 flex flex-col gap-1 min-w-[160px] animate-in slide-in-from-bottom-2">
                <button onClick={handleVideoUpload} className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                    <Video className="w-4 h-4 mr-2 text-blue-400" /> 上传视频
                </button>
                <button onClick={handleImageUpload} className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                    <ImageIcon className="w-4 h-4 mr-2 text-pink-400" /> 上传图片
                </button>
                <button onClick={handleDocUpload} className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                    <FileText className="w-4 h-4 mr-2 text-emerald-400" /> 上传文档
                </button>
            </div>
        )}
        
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            onChange={handleFileSelect}
        />

        <div className="flex items-end p-3">
            <button 
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition mr-2"
            >
                <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="给 AI 教练发送消息..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 resize-none max-h-32 py-2"
                rows={1}
                style={{ minHeight: '44px' }}
            />
            
            <button 
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && files.length === 0)}
                className={clsx(
                    "p-2 rounded-lg transition ml-2",
                    (input.trim() || files.length > 0) && !isLoading
                        ? "bg-white text-black hover:bg-slate-200" 
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                )}
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 mt-2">
          AI 可能会犯错。请核对重要信息。
      </p>
    </div>
  );
}
