"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Play, MessageSquare, FileText, Activity, HelpCircle, AlertCircle, RefreshCw, X, Clock, CheckCircle, XCircle, ChevronLeft } from "lucide-react";
import clsx from "clsx";
import axios from "axios";
import { useStudio } from "@/context/StudioContext";
import { useRouter } from "next/navigation";
import InsightCard from "@/components/InsightCard";

const COACHES = [
  { id: "hu", name: "斛教练", role: "技术分析", color: "bg-blue-500", avatarColor: "bg-blue-600", description: "严肃技术流" },
  { id: "li", name: "李指导", role: "战术分析", color: "bg-purple-500", avatarColor: "bg-purple-600", description: "战术大师" },
  { id: "an", name: "小安", role: "心理/鼓励", color: "bg-orange-500", avatarColor: "bg-orange-600", description: "活力领队" },
];

export default function VideoStudio() {
  const router = useRouter();
  const { videoState, setVideoState } = useStudio();
  const [selectedCoach, setSelectedCoach] = useState("hu");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use local refs/effects for cleanup only if needed, but Context handles state
  // We don't need to revoke URL on unmount anymore because we want it to persist
  // UNLESS we are actually clearing it.

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target?.result) {
            setVideoState(prev => ({
                ...prev,
                file: file,
                previewUrl: event.target?.result as string,
                analysisResult: null, // Clear previous result
                activeTab: "report"
            }));
        }
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleStartAnalysis = async () => {
    if (!videoState.file) return;
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", videoState.file);
    
    try {
        const response = await axios.post("/api/v1/analyze/video", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.analysis) {
             setVideoState(prev => ({
                 ...prev,
                 analysisResult: response.data.analysis,
                 activeTab: "report"
             }));
        } else {
             setError("分析失败，未返回有效结果");
        }
    } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.response?.data?.detail || "上传或分析过程中发生错误，请重试。");
    } finally {
        setIsUploading(false);
    }
  };

  const handleClearVideo = () => {
    setVideoState({
        file: null,
        previewUrl: null,
        analysisResult: null,
        activeTab: "report"
    });
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const setActiveTab = (tab: string) => {
      setVideoState(prev => ({ ...prev, activeTab: tab }));
  };

  return (
    <div className="flex h-full flex-col">
        {/* Header with Back Button */}
        <div className="flex items-center mb-4">
            <button 
                onClick={() => router.push("/dashboard")} 
                className="flex items-center text-slate-400 hover:text-white transition mr-4"
            >
                <ChevronLeft className="w-5 h-5 mr-1" /> 返回主控台
            </button>
            <h1 className="text-xl font-bold text-white">AI 视频分析室</h1>
        </div>

    <div className="flex flex-1 space-x-6 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="video/mp4,video/quicktime" 
        className="hidden" 
      />

      {/* Left: Video Player Area (60%) */}
      <div className="flex-[0.6] bg-black rounded-xl overflow-hidden relative flex flex-col border border-slate-800">
        <div className="flex-1 flex items-center justify-center relative">
            {!videoState.previewUrl ? (
                <div className="text-center">
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 hover:border-yellow-400 hover:bg-slate-900/50 transition cursor-pointer" onClick={triggerFileInput}>
                        <Upload className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-300 font-medium">点击上传视频</p>
                        <p className="text-slate-500 text-sm mt-2">支持 MP4, MOV 格式</p>
                    </div>
                    {isUploading && <p className="mt-4 text-yellow-400 animate-pulse">AI 正在深度分析您的动作...</p>}
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 relative group">
                    <video 
                        key={videoState.previewUrl} 
                        src={videoState.previewUrl} 
                        controls 
                        playsInline
                        className="w-full h-full object-contain" 
                    />
                    
                    {/* Control Overlay */}
                    {!isUploading && !videoState.analysisResult && (
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={handleStartAnalysis}
                                className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-full font-bold flex items-center shadow-lg hover:scale-105 transition"
                             >
                                 <Play className="w-5 h-5 mr-2" /> 生成深度报告
                             </button>
                             <button 
                                onClick={handleClearVideo}
                                className="bg-slate-800/80 text-white px-4 py-3 rounded-full font-bold flex items-center shadow-lg hover:bg-slate-700 transition backdrop-blur-sm"
                             >
                                 <RefreshCw className="w-5 h-5 mr-2" /> 重新上传
                             </button>
                         </div>
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-xl font-bold text-white mb-2">AI 正在进行全方位分析</h3>
                                <p className="text-slate-400 text-sm">解析动作 • 评估战术 • 生成指导</p>
                            </div>
                        </div>
                    )}
                    
                    {!isUploading && (
                        <button 
                            onClick={handleClearVideo}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition"
                            title="清除视频"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Right: Analysis Dashboard (40%) */}
      <div className="flex-[0.4] flex flex-col space-y-4 overflow-hidden">
        
        {/* Tab Navigation */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-1 flex space-x-1">
             <button 
                onClick={() => setActiveTab("report")}
                className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition", videoState.activeTab === "report" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white")}
             >
                 深度报告
             </button>
             <button 
                onClick={() => setActiveTab("coach")}
                className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition", videoState.activeTab === "coach" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white")}
             >
                 教练建议
             </button>
             <button 
                onClick={() => setActiveTab("timeline")}
                className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition", videoState.activeTab === "timeline" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white")}
             >
                 实时指导
             </button>
        </div>

        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-y-auto p-5 relative">
            {error && (
                <div className="bg-red-900/50 border border-red-700 p-3 rounded-lg flex items-start space-x-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            )}

            {!videoState.analysisResult && !isUploading && !error && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                    <Activity className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-lg font-bold text-slate-400 mb-2">等待分析</h3>
                    <p className="text-sm max-w-xs">上传视频并点击“生成深度报告”以获取 AI 教练团的专业指导</p>
                </div>
            )}

            {videoState.analysisResult && (
                <>
                    {/* Tab 1: Analysis Report */}
                    {videoState.activeTab === "report" && videoState.analysisResult.analysis_report && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Top Issues / Smart Insight Cards */}
                            {videoState.analysisResult.top_issues && videoState.analysisResult.top_issues.length > 0 && (
                                <div>
                                    <h3 className="text-[#ccff00] text-sm font-bold uppercase tracking-wider mb-3 flex items-center animate-pulse">
                                        <Activity className="w-4 h-4 mr-2" /> 智能诊断 (Smart Insights)
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {videoState.analysisResult.top_issues.map((issue: any, idx: number) => (
                                            <InsightCard
                                                key={idx}
                                                tag={issue.tag_name}
                                                severity={issue.severity || "medium"}
                                                diagnosis={issue.diagnosis}
                                                principle={issue.principle || "暂无原理解析"}
                                                drill={issue.drill_recommendation}
                                                resourceLink={issue.resource_link}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-yellow-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" /> 视频信息
                                </h3>
                                <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300 text-sm">
                                    {videoState.analysisResult.analysis_report.video_info}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sky-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center">
                                    <Activity className="w-4 h-4 mr-2" /> 动作描述
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {videoState.analysisResult.analysis_report.action_description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-900/20 border border-green-900/50 p-3 rounded-lg">
                                    <h4 className="text-green-400 font-bold text-xs mb-2 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> 优点</h4>
                                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                        {videoState.analysisResult.analysis_report.pros?.map((pro: string, idx: number) => (
                                            <li key={idx}>{pro}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg">
                                    <h4 className="text-red-400 font-bold text-xs mb-2 flex items-center"><XCircle className="w-3 h-3 mr-1"/> 不足</h4>
                                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                        {videoState.analysisResult.analysis_report.cons?.map((con: string, idx: number) => (
                                            <li key={idx}>{con}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Coach Advice */}
                    {videoState.activeTab === "coach" && videoState.analysisResult.coach_advice && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex space-x-2 mb-4">
                                {COACHES.map(coach => (
                                    <button
                                        key={coach.id}
                                        onClick={() => setSelectedCoach(coach.id)}
                                        className={clsx(
                                            "flex-1 py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1",
                                            selectedCoach === coach.id
                                                ? `${coach.color} text-white shadow-lg`
                                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                        )}
                                    >
                                        <span>{coach.name}</span>
                                        <span className="opacity-70 scale-90">{coach.description}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 min-h-[300px]">
                                <div className="flex items-center mb-4">
                                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3", COACHES.find(c => c.id === selectedCoach)?.avatarColor)}>
                                        {COACHES.find(c => c.id === selectedCoach)?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{COACHES.find(c => c.id === selectedCoach)?.name}</h3>
                                        <p className="text-xs text-slate-400">{COACHES.find(c => c.id === selectedCoach)?.role}</p>
                                    </div>
                                </div>
                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {videoState.analysisResult.coach_advice[selectedCoach]}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Timeline Commentary */}
                    {videoState.activeTab === "timeline" && videoState.analysisResult.timeline_commentary && (
                        <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800"></div>
                            {videoState.analysisResult.timeline_commentary.map((item: any, idx: number) => (
                                <div key={idx} className="relative pl-10 pb-8 last:pb-0 group">
                                    <div className="absolute left-[13px] top-1 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-900 group-hover:bg-yellow-400 transition-colors z-10"></div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg group-hover:bg-slate-800 transition border border-transparent group-hover:border-slate-700">
                                        <div className="flex items-center text-xs font-mono text-yellow-400 mb-1">
                                            <Clock className="w-3 h-3 mr-1" /> {item.timestamp}
                                        </div>
                                        <p className="text-slate-300 text-sm">{item.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
    </div>
  );
}
