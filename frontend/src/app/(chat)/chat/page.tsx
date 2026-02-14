"use client";

import { useState, useRef, useEffect } from "react";
import { ChatSidebar, SidebarTrigger } from "@/components/chat/ChatSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { VideoAnalysisCard } from "@/components/chat/VideoAnalysisCard";
import { StyleAnalysisCard } from "@/components/chat/StyleAnalysisCard";
import { Activity } from "lucide-react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

// Types for messages
type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'report_card';
    cardData?: any; 
};

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  const router = useRouter();

  // Load session messages
  useEffect(() => {
      const loadSession = async () => {
          if (!sessionId) {
              setMessages([]);
              return;
          }
          
          setIsLoading(true);
          try {
              const res = await axios.get(`/api/v1/sessions/${sessionId}`);
              if (res.data && res.data.messages) {
                  setMessages(res.data.messages);
              }
          } catch (e) {
              console.error("Failed to load session:", e);
          } finally {
              setIsLoading(false);
          }
      };
      
      loadSession();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async (text: string, files: File[]) => {
      // 1. Add User Message
      const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: text || (files.length > 0 ? `Uploaded ${files.length} file(s)` : ""),
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
          const formData = new FormData();
          if (text) formData.append("message", text);
          if (files.length > 0) formData.append("file", files[0]); 
          if (sessionId) formData.append("session_id", sessionId);

          const response = await axios.post("http://localhost:8000/api/v1/chat", formData, {
              headers: { "Content-Type": "multipart/form-data" }
          });

          const data = response.data;
          
          // If new session started, update URL
          if (data.sessionId && data.sessionId !== sessionId) {
              router.push(`/chat?id=${data.sessionId}`);
              // We don't need to add message manually if we redirect, 
              // but for smooth UX let's add it and let the effect handle the sync later or now
          }

          const aiMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: data.content,
              type: data.type,
              cardData: data.cardData
          };
          setMessages(prev => [...prev, aiMsg]);

          // Refresh sidebar history immediately
          window.dispatchEvent(new Event('chat-history-updated'));

      } catch (error) {
          console.error(error);
          const errorMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: "抱歉，处理您的请求时遇到了错误。",
          };
          setMessages(prev => [...prev, errorMsg]);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      {sidebarOpen && <ChatSidebar />}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Bar / Trigger */}
        <div className="absolute top-0 left-0 p-4 z-10">
            {!sidebarOpen && <SidebarTrigger isOpen={sidebarOpen} toggle={() => setSidebarOpen(true)} />}
        </div>

        {/* Messages Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            {messages.length === 0 ? (
                // Empty State / Welcome
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <div className="bg-slate-800 p-4 rounded-full mb-4">
                        <Activity className="w-12 h-12 text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">羽毛球智能私教</h2>
                    <p className="text-slate-400 max-w-md">
                        上传视频分析你的杀球动作，上传照片点评球场穿搭，或询问任何战术问题。
                    </p>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto pt-12 pb-4">
                    {messages.map((msg) => (
                        <MessageBubble 
                            key={msg.id} 
                            role={msg.role} 
                            content={msg.content} 
                            component={msg.type === 'report_card' ? (
                                <div className="w-full mt-2">
                                    {msg.cardData?.type === 'video' && msg.cardData.data && (
                                        <VideoAnalysisCard 
                                            videoInfo={{ 
                                                duration: msg.cardData.data.analysis_report?.video_duration || "Unknown", 
                                                type: msg.cardData.data.analysis_report?.video_info || "视频分析" 
                                            }}
                                            coaches={[
                                                { 
                                                    coach: "Hu", name: "斛教练", role: "技术指导", avatarColor: "bg-blue-500",
                                                    comment: msg.cardData.data.coach_advice?.coach_hu || "暂无点评"
                                                },
                                                { 
                                                    coach: "Li", name: "李指导", role: "战术顾问", avatarColor: "bg-purple-500",
                                                    comment: msg.cardData.data.coach_advice?.coach_li || "暂无点评"
                                                },
                                                { 
                                                    coach: "An", name: "小安", role: "心态调节", avatarColor: "bg-pink-500",
                                                    comment: msg.cardData.data.coach_advice?.coach_an || "暂无点评"
                                                }
                                            ]}
                                            issues={(msg.cardData.data.top_issues || []).map((issue: any) => ({
                                                tag: issue.tag_name,
                                                severity: issue.severity
                                            }))}
                                            archiveId={msg.cardData.archiveId}
                                        />
                                    )}
                                    {msg.cardData?.type === 'style' && msg.cardData.data && (
                                        <StyleAnalysisCard 
                                            totalScore={msg.cardData.data.total_score || 0}
                                            radarData={msg.cardData.data.radar_chart || []}
                                            coachAnComment={msg.cardData.data.coach_an_comment || msg.cardData.data.message || ""}
                                            tags={msg.cardData.data.style_tags || []}
                                            archiveId={msg.cardData.archiveId}
                                        />
                                    )}
                                </div>
                            ) : undefined}
                        />
                    ))}
                    {isLoading && (
                        <div className="flex items-center space-x-2 text-slate-500 text-sm ml-12">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-10 pb-6">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
