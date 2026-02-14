"use client";

import { History, Calendar, Filter, Archive, Video, Image, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Archives() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArchives = async () => {
      try {
        const response = await axios.get("/api/v1/archives");
        setRecords(response.data);
      } catch (error) {
        console.error("Failed to fetch archives:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArchives();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("确定要删除这条记录吗？")) {
        return;
    }

    try {
        await axios.delete(`/api/v1/archives/${id}`);
        setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
        console.error("Failed to delete record:", error);
        alert("删除失败，请稍后重试");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-white flex items-center">
            <History className="mr-3 text-slate-400" /> 历史档案库
         </h1>
         <div className="flex space-x-3">
             <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 flex items-center hover:bg-slate-800 transition">
                 <Calendar className="w-4 h-4 mr-2" /> 日期范围
             </button>
             <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 flex items-center hover:bg-slate-800 transition">
                 <Filter className="w-4 h-4 mr-2" /> 筛选类型
             </button>
         </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
      ) : records.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
              <div className="bg-slate-900/50 p-8 rounded-full mb-6 border border-slate-800">
                  <Archive className="h-16 w-16 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">档案库是空的</h3>
              <p className="text-slate-400 max-w-md mb-8">
                  您还没有进行过任何分析。所有的视频分析报告和穿搭点评都会自动保存在这里。
              </p>
              <div className="flex space-x-4">
                  <Link href="/chat" className="px-6 py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-300 transition">
                      开始新分析
                  </Link>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-8">
              {records.map((record) => (
                  <div 
                    key={record.id} 
                    onClick={() => router.push(`/archives/${record.id}`)}
                    className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition group cursor-pointer"
                  >
                      <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                              <div className={clsx("p-2 rounded-lg", record.type === "video" ? "bg-blue-900/30 text-blue-400" : "bg-pink-900/30 text-pink-400")}>
                                  {record.type === "video" ? <Video className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                              </div>
                              <span className="text-xs text-slate-500">{record.date}</span>
                          </div>
                          <h3 className="text-white font-bold mb-2 line-clamp-1 group-hover:text-yellow-400 transition">{record.title}</h3>
                          
                          {record.type === "video" && (
                              <div className="space-y-2 mb-3">
                                  {record.details?.top_issues && record.details.top_issues.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                          {record.details.top_issues.slice(0, 3).map((issue: any, idx: number) => (
                                              <span key={idx} className={clsx(
                                                  "text-[10px] px-1.5 py-0.5 rounded border",
                                                  issue.severity === "high" ? "bg-red-900/30 text-red-400 border-red-800" :
                                                  issue.severity === "medium" ? "bg-yellow-900/30 text-yellow-400 border-yellow-800" :
                                                  "bg-blue-900/30 text-blue-400 border-blue-800"
                                              )}>
                                                  {issue.tag_name.split('(')[0]}
                                              </span>
                                          ))}
                                      </div>
                                  )}
                                  <p className="text-xs text-slate-400 line-clamp-2">
                                      {record.details?.coach_advice?.coach_hu || record.details?.action_description}
                                  </p>
                              </div>
                          )}

                          {record.type === "style" && (
                              <div className="space-y-2 mb-3">
                                  {record.details?.tags && record.details.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                          {record.details.tags.slice(0, 3).map((tag: string, idx: number) => (
                                              <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                                  #{tag}
                                              </span>
                                          ))}
                                      </div>
                                  )}
                                  <p className="text-xs text-slate-400 line-clamp-2">
                                      {record.details?.coach_an_comment || record.details?.analysis}
                                  </p>
                              </div>
                          )}
                      </div>
                      <div className="px-4 py-3 bg-slate-950/30 border-t border-slate-800 flex justify-between items-center text-xs font-medium text-slate-400 group-hover:text-white transition">
                          <span className="flex items-center">
                              查看详情 <ChevronRight className="w-4 h-4 ml-1" />
                          </span>
                          <button 
                              onClick={(e) => handleDelete(e, record.id)}
                              className="text-slate-500 hover:text-red-400 transition p-1"
                              title="删除记录"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}
