"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar, Video, Image, Heart, ArrowRight, FileText, Sparkles, X, Archive, Filter, AlertCircle, Share2, Download, Trash2 } from "lucide-react";
import StyleRadarChart from "@/components/StyleRadarChart";
import clsx from "clsx";
import axios from "axios";
import { toPng } from 'html-to-image';
import { useRef } from 'react';

export default function ArchiveDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Modal states for Style Analysis
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showPraiseModal, setShowPraiseModal] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
        if (!id) return;
        try {
            const response = await axios.get(`/api/v1/archives/${id}`);
            setRecord(response.data);
        } catch (error) {
            console.error("Failed to fetch record:", error);
        } finally {
            setLoading(false);
        }
    };

    loadRecord();
  }, [id]);

  const handleDelete = async () => {
      if (!confirm("确定要删除这条档案记录吗？")) return;
      try {
          await axios.delete(`/api/v1/archives/${id}`);
          alert("删除成功");
          router.replace("/archives");
      } catch (error) {
          console.error("Delete failed:", error);
          alert("删除失败");
      }
  };

  const handleExport = async () => {
      // Generate HTML Content
      const isStyle = record.type === "style";
      const title = isStyle ? "穿搭分析报告" : "视频技术分析";
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${record.created_at?.split("T")[0]}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f8fafc; color: #334155; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0f172a; color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 20px; font-weight: bold; margin: 0; }
        .meta { color: #94a3b8; font-size: 14px; margin-top: 4px; }
        .badge { background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; font-family: monospace; }
        .content { padding: 24px; }
        .section-title { font-size: 16px; font-weight: bold; color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 12px; margin: 30px 0 16px 0; }
        .text-block { font-size: 15px; line-height: 1.8; color: #475569; white-space: pre-wrap; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .coach-card { background: #f1f5f9; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .coach-header { display: flex; align-items: center; margin-bottom: 12px; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 12px; }
        .avatar.Li { background: #a855f7; }
        .avatar.An { background: #ec4899; }
        .coach-name { font-weight: bold; font-size: 14px; color: #1e293b; }
        .coach-role { font-size: 12px; color: #64748b; }
        .comment { font-size: 14px; line-height: 1.6; color: #475569; }
        .tag { display: inline-block; background: #eff6ff; color: #3b82f6; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-right: 8px; margin-bottom: 8px; border: 1px solid #dbeafe; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div>
                <h1 class="title">${title}</h1>
                <p class="meta">日期: ${record.created_at?.split("T")[0]} | ID: ${id}</p>
            </div>
            <div class="badge">AI Archive</div>
        </div>
        
        <div class="content">
            ${isStyle ? `
                <div class="section-title">综合评分</div>
                <div style="font-size: 36px; font-weight: bold; color: #10b981; margin-bottom: 20px;">
                    ${data.total_score || 0} <span style="font-size: 16px; color: #64748b; font-weight: normal;">分</span>
                </div>

                <div class="section-title">详细点评</div>
                <div class="text-block">
                    ${data.detailed_review?.highlights ? `<strong>✨ 亮点:</strong>\n${data.detailed_review.highlights}\n\n` : ''}
                    ${data.detailed_review?.suggestions ? `<strong>💡 建议:</strong>\n${data.detailed_review.suggestions}` : (data.analysis || '暂无详细内容')}
                </div>
            ` : `
                <div class="section-title">动作描述</div>
                <div class="text-block">${data.analysis_report?.action_description || "暂无描述"}</div>

                <div class="section-title">教练点评</div>
                <div class="grid">
                    ${data.coach_advice ? `
                        <div class="coach-card">
                            <div class="coach-header"><div class="avatar">Hu</div><div class="coach-name">斛教练</div></div>
                            <div class="comment">${data.coach_advice.coach_hu || "无"}</div>
                        </div>
                        <div class="coach-card">
                            <div class="coach-header"><div class="avatar Li">Li</div><div class="coach-name">李指导</div></div>
                            <div class="comment">${data.coach_advice.coach_li || "无"}</div>
                        </div>
                        <div class="coach-card">
                            <div class="coach-header"><div class="avatar An">An</div><div class="coach-name">小安</div></div>
                            <div class="comment">${data.coach_advice.coach_an || "无"}</div>
                        </div>
                    ` : '暂无教练点评'}
                </div>

                <div class="section-title">核心问题</div>
                <div>
                    ${data.top_issues ? data.top_issues.map((issue: any) => `
                        <span class="tag">${issue.tag_name}</span>
                    `).join('') : '无'}
                </div>
            `}
        </div>
    </div>
    <div class="footer">
        Generated by 羽球智能私教 (Badminton AI Coach)
    </div>
</body>
</html>
      `;

      // Create Blob and Download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archive-${id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleShare = () => {
      // Simulate copying link
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
          alert("链接已复制到剪贴板！您可以直接分享给好友。");
      }).catch(() => {
          alert("复制失败，请手动复制浏览器地址栏链接。");
      });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <p className="mb-4">未找到该记录</p>
        <button onClick={() => router.back()} className="text-yellow-400 hover:underline">返回档案库</button>
      </div>
    );
  }

  const isStyle = record.type === "style";
  
  // Normalize data: if analysis is nested, merge it to top level for easier access
  const rawData = record.data || {};
  const data = rawData.analysis ? { ...rawData, ...rawData.analysis } : rawData;

  // --- Render Helpers for Style Analysis ---
  const renderStyleAnalysisContent = () => {
      const analysisResult = data;
      if (!analysisResult) return null;

      if (analysisResult.detailed_review) {
          const { highlights, suggestions } = analysisResult.detailed_review;
          return (
              <div className="space-y-4">
                   {highlights && (
                       <div>
                           <h4 className="text-[#ccff00] text-sm font-bold mb-1">✨ 亮点解析</h4>
                           <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{highlights}</p>
                       </div>
                   )}
                   {suggestions && (
                       <div>
                           <h4 className="text-pink-400 text-sm font-bold mb-1">💡 穿搭建议</h4>
                           <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{suggestions}</p>
                       </div>
                   )}
                   {analysisResult.style_tags && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {analysisResult.style_tags.map((tag: string, idx: number) => (
                                <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                   )}
              </div>
          );
      }
      
      if (analysisResult.analysis) {
        if (typeof analysisResult.analysis === 'string') {
            return <p className="text-slate-300 text-sm whitespace-pre-wrap">{analysisResult.analysis}</p>;
        }
        return (
            <div className="space-y-4">
                {Object.entries(analysisResult.analysis).map(([key, value]) => (
                    <div key={key}>
                        <h4 className="text-yellow-400 text-sm font-bold mb-1">{key}</h4>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{String(value)}</p>
                    </div>
                ))}
            </div>
        );
      }

      return <p className="text-slate-500 text-sm">暂无详细分析内容</p>;
  };

  return (
    <div className="h-full flex flex-col" ref={contentRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
            onClick={() => router.back()} 
            className="flex items-center text-slate-400 hover:text-white transition"
        >
            <ChevronLeft className="w-5 h-5 mr-1" /> 返回档案库
        </button>
        <div className="flex items-center space-x-3">
            <div className="flex items-center text-slate-500 text-sm mr-2">
                <Calendar className="w-4 h-4 mr-2" />
                {record.created_at?.split("T")[0]}
            </div>
            
            {/* Action Buttons */}
            <button 
                onClick={handleShare}
                className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700 transition"
                title="分享链接"
            >
                <Share2 className="w-4 h-4" />
            </button>
            <button 
                onClick={handleExport}
                className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700 transition"
                title="导出图片"
            >
                <Download className="w-4 h-4" />
            </button>
            <button 
                onClick={handleDelete}
                className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-red-400 hover:bg-slate-700 transition"
                title="删除档案"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="flex items-center mb-6">
          <div className={clsx("p-3 rounded-xl mr-4", isStyle ? "bg-pink-900/30 text-pink-400" : "bg-blue-900/30 text-blue-400")}>
              {isStyle ? <Image className="w-8 h-8" /> : <Video className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-white">
              {isStyle ? "穿搭分析报告" : "视频技术分析"}
          </h1>
      </div>

      {/* Style Analysis Layout */}
      {isStyle && (
          <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
              {/* Left: Radar Chart & Score & Image */}
              <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col overflow-y-auto">
                  {data.file_url && (
                      <div className="mb-6 rounded-lg overflow-hidden border border-slate-700">
                          <img src={data.file_url} alt="Uploaded Style" className="w-full h-auto object-cover" />
                      </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">形象雷达图</h3>
                      {data.total_score && (
                          <span className="text-4xl font-black text-[#ccff00]">{data.total_score} <span className="text-sm text-slate-500 font-normal">分</span></span>
                      )}
                  </div>
                  <div className="flex-1 flex items-center justify-center min-h-[300px]">
                      {data.radar_chart ? (
                          <StyleRadarChart data={data.radar_chart} />
                      ) : (
                          <div className="text-slate-600">暂无数据</div>
                      )}
                  </div>
              </div>

              {/* Right: Cards */}
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                  {/* Praise Card */}
                  <div 
                    onClick={() => (data.coach_an_comment || data.message) && setShowPraiseModal(true)}
                    className={`bg-gradient-to-br from-orange-500 to-pink-600 p-6 rounded-xl text-white relative overflow-hidden shadow-lg transition-transform group ${
                        (data.coach_an_comment || data.message) 
                        ? "cursor-pointer hover:scale-[1.02]" 
                        : "opacity-80"
                    }`}
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition">
                          <Heart className="w-24 h-24" />
                      </div>
                      <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold mr-2">安</div>
                                  <span className="font-bold text-white/90">小安的夸夸卡</span>
                              </div>
                              {(data.coach_an_comment || data.message) && (
                                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                          </div>
                          <p className="text-2xl font-bold leading-tight italic line-clamp-2">
                              {data.coach_an_comment || data.message || "\"快上传照片，让我看看你今天的球场风采！\""}
                          </p>
                      </div>
                  </div>

                  {/* Analysis Details Card */}
                  <div 
                    onClick={() => setShowAnalysisModal(true)}
                    className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden group transition-all cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 flex-1"
                  >
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center">
                              <FileText className="w-4 h-4 mr-2" /> 分析详情
                          </h3>
                          <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="text-slate-500 text-sm">
                           <div className="flex flex-col gap-2">
                               <p className="line-clamp-4 text-slate-300">
                                   {data.detailed_review?.highlights || data.analysis || "点击查看详细分析报告..."}
                               </p>
                               <span className="text-[#ccff00] text-xs mt-2 inline-block">点击展开完整报告 &rarr;</span>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Video Analysis Layout */}
      {!isStyle && (
          <div className="flex flex-col gap-6 h-full overflow-y-auto">
              {/* Top Section: Video Player & Info */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  {data.file_url && (
                      <div className="mb-6 rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                          <video src={data.file_url} controls className="w-full h-full" />
                      </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center">
                          <Video className="w-5 h-5 mr-2 text-blue-400" /> 
                          {data.analysis_report?.video_info || "视频分析"}
                          {data.analysis_report?.video_duration && (
                              <span className="ml-2 text-sm text-slate-400 font-normal bg-slate-800 px-2 py-0.5 rounded">
                                  {data.analysis_report.video_duration}
                              </span>
                          )}
                      </h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 p-4 rounded-lg">
                      {data.analysis_report?.action_description || "暂无动作描述"}
                  </p>
              </div>

              {/* Middle Section: Coach Advice Cards */}
              {data.coach_advice && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Coach Hu (Technical) */}
                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 relative overflow-hidden group hover:border-blue-500/50 transition">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                              <Archive className="w-16 h-16" />
                          </div>
                          <h4 className="text-blue-400 font-bold mb-3 flex items-center">
                              <span className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center mr-2 text-xs">斛</span>
                              斛教练 (技术)
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                              {data.coach_advice.coach_hu}
                          </p>
                      </div>

                      {/* Coach Li (Tactical) */}
                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 relative overflow-hidden group hover:border-purple-500/50 transition">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                              <Filter className="w-16 h-16" />
                          </div>
                          <h4 className="text-purple-400 font-bold mb-3 flex items-center">
                              <span className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center mr-2 text-xs">李</span>
                              李指导 (战术)
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                              {data.coach_advice.coach_li}
                          </p>
                      </div>

                      {/* Coach An (Mental) */}
                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 relative overflow-hidden group hover:border-pink-500/50 transition">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                              <Heart className="w-16 h-16" />
                          </div>
                          <h4 className="text-pink-400 font-bold mb-3 flex items-center">
                              <span className="w-6 h-6 rounded-full bg-pink-900/50 flex items-center justify-center mr-2 text-xs">安</span>
                              小安 (心态)
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                              {data.coach_advice.coach_an}
                          </p>
                      </div>
                  </div>
              )}

              {/* Bottom Section: Top Issues & Drills */}
              {data.top_issues && data.top_issues.length > 0 && (
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" /> 核心问题诊断 & 训练处方
                      </h3>
                      <div className="space-y-4">
                          {data.top_issues.map((issue: any, idx: number) => (
                              <div key={idx} className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition">
                                  <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                          <span className={clsx(
                                              "text-xs font-bold px-2 py-1 rounded",
                                              issue.severity === "high" ? "bg-red-500/20 text-red-400" :
                                              issue.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                                              "bg-blue-500/20 text-blue-400"
                                          )}>
                                              {issue.tag_name}
                                          </span>
                                          <h4 className="text-white font-bold text-sm">{issue.diagnosis}</h4>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                                      <div>
                                          <span className="text-slate-500 block text-xs mb-1">技术原理</span>
                                          <p className="text-slate-300">{issue.principle}</p>
                                      </div>
                                      <div>
                                          <span className="text-[#ccff00] block text-xs mb-1">训练推荐</span>
                                          <p className="text-white font-medium">{issue.drill_recommendation}</p>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- Modals --- */}
      
      {/* Analysis Modal */}
      {showAnalysisModal && isStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAnalysisModal(false)}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setShowAnalysisModal(false)}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
                
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Sparkles className="w-5 h-5 text-[#ccff00] mr-2" /> 穿搭分析报告
                </h2>
                
                {renderStyleAnalysisContent()}
                
                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <button 
                        onClick={() => setShowAnalysisModal(false)}
                        className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Praise Modal */}
      {showPraiseModal && isStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowPraiseModal(false)}>
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl w-full max-w-lg shadow-2xl p-8 relative text-center transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                      <Heart className="w-64 h-64" />
                 </div>
                 
                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <span className="text-3xl font-bold text-white">安</span>
                 </div>
                 
                 <h3 className="text-white/80 font-bold text-lg mb-6 uppercase tracking-widest">来自小安的特别鼓励</h3>
                 
                 <p className="text-3xl md:text-4xl font-black text-white leading-tight italic mb-8 drop-shadow-lg">
                      {data.coach_an_comment || data.message || "\"你今天的穿搭简直太棒了！\""}
                 </p>
                 
                 <button 
                    onClick={() => setShowPraiseModal(false)}
                    className="px-8 py-3 bg-white text-pink-600 rounded-full font-bold hover:scale-105 transition shadow-lg"
                 >
                    谢谢小安！
                 </button>
            </div>
        </div>
      )}

    </div>
  );
}
