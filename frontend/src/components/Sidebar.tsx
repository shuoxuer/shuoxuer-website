"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, Image, History, Settings, Activity, Upload, PlayCircle } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import axios from "axios";

const navItems = [
  { name: "总控台", href: "/dashboard", icon: LayoutDashboard },
  { name: "视频分析室", href: "/video-studio", icon: Video },
  { name: "穿搭风尚室", href: "/style-studio", icon: Image },
  { name: "历史档案", href: "/archives", icon: History },
  { name: "设置中心", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
        try {
            const response = await axios.get("/api/v1/dashboard/stats");
            if (response.data.recent_records) {
                setRecentRecords(response.data.recent_records.slice(0, 3)); // Take top 3 for sidebar
            }
        } catch (error) {
            console.error("Failed to fetch sidebar stats:", error);
        }
    };
    
    // Initial fetch
    fetchRecent();
    
    // Optional: Poll or listen to event (omitted for simplicity, assume refresh on nav)
  }, [pathname]); // Refresh when navigating might be good enough for now

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 border-r border-slate-800 text-white shrink-0">
      <div className="flex items-center justify-center h-16 border-b border-slate-800">
        <Activity className="h-8 w-8 text-yellow-400 mr-2" />
        <span className="text-xl font-bold tracking-wider">羽球智能私教</span>
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

        {/* Action Group */}
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

        {/* Recent List */}
        <div className="px-2">
            <div className="flex items-center justify-between px-2 mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">最近记录</p>
                <Link href="/archives" className="text-xs text-slate-500 hover:text-white">全部</Link>
            </div>
            <div className="space-y-2">
                {recentRecords.length > 0 ? (
                    recentRecords.map((record) => (
                        <div key={record.id} className="flex items-center px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-800/30 hover:border-slate-700 transition">
                            <div className={clsx("w-2 h-2 rounded-full mr-3 shrink-0", record.type === "视频分析" ? "bg-blue-500" : "bg-pink-500")}></div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-slate-300 truncate font-medium">{record.result}</p>
                                <p className="text-[10px] text-slate-500">{record.date}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-xs text-slate-500 bg-slate-950/30 rounded-lg border border-slate-800/30">
                        暂无最近记录
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">每日贴士</p>
            <p className="text-sm italic text-slate-300">"时刻保持举拍动作！"</p>
        </div>
      </div>
    </div>
  );
}
