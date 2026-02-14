"use client";

import Link from "next/link";
import { Video, Image, Activity, Clock, TrendingUp, Sparkles, ChevronRight, BookOpen, MessageSquare } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import InsightCard from "@/components/InsightCard";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
      total_training_time: 0,
      focus_areas: [] as string[],
      style_score: 0,
      recent_records: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
        try {
            const response = await axios.get("/api/v1/dashboard/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">欢迎回来, 运动员</h1>
          <p className="text-slate-400 mt-1">准备好提升你的球技了吗？</p>
        </div>
        <div className="flex space-x-4">
           {/* Quick Actions */}
           <Link href="/documentation" className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-emerald-400 transition shadow-lg shadow-emerald-400/20">
             <BookOpen className="w-5 h-5 mr-2" />
             知识库
           </Link>
           <Link href="/chat" className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20">
             <MessageSquare className="w-5 h-5 mr-2" />
             开始分析/对话
           </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Training Time */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Clock className="w-24 h-24 text-yellow-400" />
            </div>
            <h3 className="text-slate-400 font-medium mb-2 flex items-center"><Clock className="w-4 h-4 mr-2 text-yellow-400"/> 累计分析时长</h3>
            <div className="text-3xl font-bold text-white">
                {isLoading ? "-" : stats.total_training_time} <span className="text-sm font-normal text-slate-500">分钟</span>
            </div>
            <div className="text-slate-500 text-sm mt-2">
                {stats.total_training_time > 0 ? "保持这个节奏！" : "开始你的第一次分析吧"}
            </div>
        </div>

        {/* Focus Areas */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <TrendingUp className="w-24 h-24 text-sky-400" />
            </div>
            <h3 className="text-slate-400 font-medium mb-2 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-sky-400"/> 重点提升领域</h3>
            <div className="flex flex-wrap gap-2 mt-1 relative z-10">
                {isLoading ? (
                    <span className="text-slate-500">加载中...</span>
                ) : stats.focus_areas.length > 0 ? (
                    stats.focus_areas.map((area: string, idx: number) => (
                        <InsightCard
                            key={idx}
                            tag={area}
                            severity="medium"
                            diagnosis="根据您最近的训练记录，这是您的高频扣分项。"
                            principle="持续的刻意练习是改善此问题的关键。"
                            drill="建议查看最新视频报告以获取定制训练计划。"
                        />
                    ))
                ) : (
                    <span className="text-white font-bold text-xl">--</span>
                )}
            </div>
            <div className="text-slate-500 text-sm mt-2">
                {stats.focus_areas.length > 0 ? "点击标签查看简要诊断" : "等待数据生成"}
            </div>
        </div>

        {/* Style Score */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Sparkles className="w-24 h-24 text-pink-400" />
            </div>
            <h3 className="text-slate-400 font-medium mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-pink-400"/> 穿搭风尚分</h3>
            <div className="text-3xl font-bold text-white">
                {isLoading ? "-" : stats.style_score} <span className="text-sm font-normal text-slate-500">/ 100</span>
            </div>
            <div className="text-slate-500 text-sm mt-2">
                {stats.style_score > 0 ? "你的球场造型很有范儿！" : "暂无 OOTD 记录"}
            </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">最近训练记录</h2>
            <Link href="/archives" className="text-sm text-slate-400 hover:text-white flex items-center">
                查看全部 <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
        </div>
        
        {isLoading ? (
             <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 text-center text-slate-500">
                 加载记录中...
             </div>
        ) : stats.recent_records.length > 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {stats.recent_records.map((record: any) => (
                    <div key={record.id} className="p-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition flex items-center justify-between group">
                        <div className="flex items-center">
                            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center mr-4", 
                                record.type === "视频分析" ? "bg-blue-900/30 text-blue-400" : "bg-pink-900/30 text-pink-400"
                            )}>
                                {record.type === "视频分析" ? <Video className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1 group-hover:text-yellow-400 transition">{record.result}</h4>
                                <p className="text-slate-500 text-xs">{record.date} • {record.type}</p>
                            </div>
                        </div>
                        <div className="text-slate-500 group-hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-slate-900/50 p-12 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <Activity className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">暂无训练记录</h3>
                <p className="text-slate-400 mb-6">您还没有上传过任何视频或图片。</p>
                <Link href="/chat" className="text-yellow-400 hover:text-yellow-300 font-medium">
                    立即开始分析 &rarr;
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}
