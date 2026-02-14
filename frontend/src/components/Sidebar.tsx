"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, History, Settings, Activity, BookOpen, BrainCircuit, ListChecks } from "lucide-react";
import clsx from "clsx";
import { useState, useMemo } from "react";
import historyData from "@/data/history.json";

const navItems = [
  { name: "总控台", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI 智能私教", href: "/chat", icon: MessageSquare },
  { name: "历史档案", href: "/archives", icon: History },
  { name: "羽毛球知识库", href: "/documentation", icon: BookOpen },
];

const knowledgeItems = [
    { name: "知识库管理", href: "/knowledge", icon: BrainCircuit },
    { name: "待审核条目", href: "/knowledge/review", icon: ListChecks },
];

export function Sidebar() {
  const pathname = usePathname();

  const recentRecords = useMemo(() => {
    return historyData.slice(0, 3).map(item => {
        const isVideo = item.type === "video";
        const dateObj = new Date(item.created_at);
        const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        
        let result = "";
        if (isVideo) {
             result = "正手高远球练习";
             if ((item.data as any)?.analysis_report?.video_info?.includes("杀球")) {
                 result = "高远球与杀球训练";
             }
        } else {
             result = `穿搭评分: ${(item.data as any)?.total_score || 0}分`;
        }

        return {
            id: item.id,
            type: isVideo ? "视频分析" : "穿搭分析",
            result: result,
            date: dateStr
        };
    });
  }, []);

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 border-r border-slate-800 text-white shrink-0">
      <div className="flex items-center justify-center h-16 border-b border-slate-800">
        <Activity className="h-8 w-8 text-yellow-400 mr-2" />
        <span className="text-xl font-bold tracking-wider">羽毛球智能私教</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {/* Navigation Items */}
        <nav className="space-y-1 mb-8">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                        "flex items-center px-4 py-3 rounded-lg transition-colors duration-200",
                        isActive
                        ? "bg-slate-800 text-yellow-400 font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                    >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                    </Link>
                );
            })}
        </nav>

        {/* Knowledge Management */}
        <div className="mb-8 px-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">知识库管理</p>
            <nav className="space-y-1">
                {knowledgeItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                            "flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200",
                            isActive
                            ? "bg-slate-800 text-yellow-400 font-medium"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                        >
                        <Icon className="h-4 w-4 mr-3" />
                        <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>

        {/* Action Group - Removed per new design
        <div className="mb-8 px-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">新建分析</p>
            <div className="space-y-2">
                <Link href="/video-studio" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition">
                    <Upload className="h-4 w-4 mr-3 text-sky-400" />
                    上传视频
                </Link>
                <Link href="/style-studio" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition">
                    <Image className="h-4 w-4 mr-3 text-pink-400" />
                    上传穿搭照
                </Link>
            </div>
        </div>
        */}
      </div>

      <div className="p-4 border-t border-slate-800">
        <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white transition">
            <Settings className="h-4 w-4 mr-3" />
            设置中心
        </Link>
      </div>
    </div>
  );
}
