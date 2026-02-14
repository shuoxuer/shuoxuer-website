"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, ListChecks, AlertCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function KnowledgeReview() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
        const res = await axios.get("/api/v1/knowledge/list?status=pending");
        setCandidates(res.data);
    } catch (error) {
        console.error("Failed to load candidates:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
      try {
          await axios.put(`/api/v1/knowledge/${id}/approve`);
          setCandidates(prev => prev.filter(c => c.id !== id));
      } catch (error) {
          alert("操作失败");
      }
  };

  const handleReject = async (id: string) => {
      if (!confirm("确定拒绝并移除此条目吗？")) return;
      try {
          await axios.put(`/api/v1/knowledge/${id}/reject`);
          setCandidates(prev => prev.filter(c => c.id !== id));
      } catch (error) {
          alert("操作失败");
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ListChecks className="mr-3 text-yellow-400" /> 待审核知识条目
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI 自动提取或用户提交的候选知识点</p>
        </div>
        <button 
            onClick={loadCandidates}
            className="flex items-center text-sm text-slate-400 hover:text-white transition"
        >
            <RefreshCw className={clsx("w-4 h-4 mr-2", loading && "animate-spin")} /> 刷新列表
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
          {candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500">
                  <Check className="w-12 h-12 mb-4 text-emerald-500/50" />
                  <p>没有待审核的条目，所有知识点已归档。</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-4">
                  {candidates.map((item) => (
                      <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-slate-700 transition">
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                  <span className="bg-yellow-900/30 text-yellow-400 text-xs px-2 py-0.5 rounded border border-yellow-800 font-mono">
                                      {item.source || "AI_CHAT"}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                      {new Date(item.created_at).toLocaleString()}
                                  </span>
                              </div>
                              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-3">
                                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                      {item.content}
                                  </p>
                              </div>
                              {item.tags && item.tags.length > 0 && (
                                  <div className="flex gap-2">
                                      {item.tags.map((tag: string, idx: number) => (
                                          <span key={idx} className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                              #{tag}
                                          </span>
                                      ))}
                                  </div>
                              )}
                          </div>
                          
                          <div className="flex md:flex-col gap-3 justify-center md:border-l md:border-slate-800 md:pl-6 md:w-32">
                              <button 
                                onClick={() => handleApprove(item.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center transition"
                              >
                                  <Check className="w-4 h-4 mr-1" /> 通过
                              </button>
                              <button 
                                onClick={() => handleReject(item.id)}
                                className="flex-1 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-400 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition"
                              >
                                  <X className="w-4 h-4 mr-1" /> 拒绝
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}
