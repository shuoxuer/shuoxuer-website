"use client";

import { useState, useRef, useEffect } from "react";
import { Image, Share2, Heart, Upload, AlertCircle, RefreshCw, Sparkles, X, ChevronLeft, ArrowRight, FileText } from "lucide-react";
import axios from "axios";
import { useStudio } from "@/context/StudioContext";
import { useRouter } from "next/navigation";
import StyleRadarChart from "@/components/StyleRadarChart";

export default function StyleStudio() {
  const router = useRouter();
  const { styleState, setStyleState } = useStudio();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issueNumber, setIssueNumber] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal states
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showPraiseModal, setShowPraiseModal] = useState(false);

  useEffect(() => {
    // Generate a random issue number on client-side only to avoid hydration mismatch
    setIssueNumber(Math.floor(Math.random() * 100) + 1);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target?.result) {
            setStyleState(prev => ({
                ...prev,
                file: file,
                previewUrl: event.target?.result as string,
                analysisResult: null
            }));
        }
    };
    reader.readAsDataURL(file);

    setError(null);
  };

  const handleStartAnalysis = async () => {
    if (!styleState.file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("photo", styleState.file);

    try {
        const response = await axios.post("/api/v1/analysis/style", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        
        setStyleState(prev => ({
            ...prev,
            analysisResult: response.data
        }));
    } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.response?.data?.detail || err.message || "上传或分析过程中发生错误，请重试。");
    } finally {
        setIsUploading(false);
    }
  };

  const handleClearPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering parent click if any
    setStyleState({
        file: null,
        previewUrl: null,
        analysisResult: null
    });
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderAnalysisContent = () => {
      // If no result yet, show placeholder or nothing
      if (!styleState.analysisResult) return <p className="text-slate-500 text-sm">等待分析结果...</p>;

      // If detailed_review exists (new format)
      if (styleState.analysisResult.detailed_review) {
          const { highlights, suggestions } = styleState.analysisResult.detailed_review;
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
                   {styleState.analysisResult.style_tags && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {styleState.analysisResult.style_tags.map((tag: string, idx: number) => (
                                <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                   )}
              </div>
          );
      }
      
      // Fallback for older format or raw analysis text
      if (styleState.analysisResult.analysis) {
        if (typeof styleState.analysisResult.analysis === 'string') {
            return <p className="text-slate-300 text-sm whitespace-pre-wrap">{styleState.analysisResult.analysis}</p>;
        }
        return (
            <div className="space-y-4">
                {Object.entries(styleState.analysisResult.analysis).map(([key, value]) => (
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
    <div className="flex h-full flex-col">
        {/* Header with Back Button */}
        <div className="flex items-center mb-4">
            <button 
                onClick={() => router.push("/dashboard")} 
                className="flex items-center text-slate-400 hover:text-white transition mr-4"
            >
                <ChevronLeft className="w-5 h-5 mr-1" /> 返回主控台
            </button>
            <h1 className="text-xl font-bold text-white">穿搭风尚室</h1>
        </div>

    <div className="flex flex-1 space-x-6 overflow-hidden">
       <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png,image/jpeg,image/jpg" 
        className="hidden" 
      />

       {/* Left: Magazine Cover Display (50%) */}
       <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 group">
          {/* Image Display */}
          {styleState.previewUrl ? (
              <>
                  <img src={styleState.previewUrl} alt="OOTD" className="absolute inset-0 w-full h-full object-cover" />
                  
                  {/* Control Overlay - Show when not uploading and not analyzed yet */}
                  {!isUploading && !styleState.analysisResult && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                           <button 
                              onClick={handleStartAnalysis}
                              className="bg-pink-500 text-white px-6 py-3 rounded-full font-bold flex items-center shadow-lg hover:scale-105 transition"
                           >
                               <Sparkles className="w-5 h-5 mr-2" /> 生成时尚封面
                           </button>
                           <button 
                              onClick={handleClearPhoto}
                              className="bg-slate-800/80 text-white px-4 py-3 rounded-full font-bold flex items-center shadow-lg hover:bg-slate-700 transition backdrop-blur-sm"
                           >
                               <RefreshCw className="w-5 h-5 mr-2" /> 重新上传
                           </button>
                       </div>
                  )}

                  {/* Close button top right */}
                  {!isUploading && (
                        <button 
                            onClick={handleClearPhoto}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition z-40"
                            title="清除照片"
                        >
                            <X className="w-5 h-5" />
                        </button>
                  )}
              </>
          ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 cursor-pointer hover:bg-slate-800/80 transition" onClick={triggerFileInput}>
                 <div className="text-center">
                    <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">点击上传照片以生成时尚封面</p>
                 </div>
              </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10"></div>
          
          {/* Overlay Content - Magazine Title */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 pointer-events-none">
             <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2" style={{fontFamily: 'Impact, sans-serif'}}>BADMINTON <br/><span className="text-yellow-400">OOTD</span></h1>
             <div className="flex items-center space-x-4 text-white font-mono text-sm">
                 <span suppressHydrationWarning>{new Date().toLocaleDateString()}</span>
                 <span className="w-1 h-1 bg-white rounded-full"></span>
                 <span>ISSUE {issueNumber}</span>
             </div>
          </div>

          {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                  <div className="text-center">
                      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-pink-400 font-bold">正在分析穿搭风格...</p>
                  </div>
              </div>
          )}
       </div>

       {/* Right: Analysis Panel (50%) */}
       <div className="flex-1 flex flex-col space-y-6 overflow-y-auto">
          {error && (
            <div className="bg-red-900/50 border border-red-700 p-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {!styleState.analysisResult && !isUploading && !error && (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                  <p>{styleState.file ? "点击左侧“生成时尚封面”开始分析" : "上传照片后查看 AI 分析报告"}</p>
              </div>
          )}

          {/* Radar Chart Area */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">形象雷达图</h3>
                  {styleState.analysisResult?.total_score && (
                      <span className="text-2xl font-black text-[#ccff00]">{styleState.analysisResult.total_score} <span className="text-xs text-slate-500 font-normal">分</span></span>
                  )}
              </div>
              
              {styleState.analysisResult?.radar_chart ? (
                  <StyleRadarChart data={styleState.analysisResult.radar_chart} />
              ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-600 bg-slate-950/50 rounded-xl">
                      暂无数据
                  </div>
              )}
          </div>

          {/* Praise Card (Clickable) */}
          <div 
            onClick={() => (styleState.analysisResult?.coach_an_comment || styleState.analysisResult?.message) && setShowPraiseModal(true)}
            className={`bg-gradient-to-br from-orange-500 to-pink-600 p-6 rounded-xl text-white relative overflow-hidden shadow-lg transition-transform group ${
                (styleState.analysisResult?.coach_an_comment || styleState.analysisResult?.message) 
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
                      {(styleState.analysisResult?.coach_an_comment || styleState.analysisResult?.message) && (
                          <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                  </div>
                  <p className="text-2xl font-bold leading-tight italic line-clamp-2">
                      {styleState.analysisResult?.coach_an_comment || styleState.analysisResult?.message || "\"快上传照片，让我看看你今天的球场风采！\""}
                  </p>
              </div>
          </div>

          {/* Analysis Details Card (Clickable) */}
          <div 
            onClick={() => styleState.analysisResult && setShowAnalysisModal(true)}
            className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden group transition-all ${styleState.analysisResult ? "cursor-pointer hover:border-slate-600 hover:bg-slate-800/50" : "opacity-50 cursor-not-allowed"}`}
          >
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center">
                      <FileText className="w-4 h-4 mr-2" /> 分析详情
                  </h3>
                  {styleState.analysisResult && <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
              
              <div className="text-slate-500 text-sm">
                   {styleState.analysisResult ? (
                       <div className="flex flex-col gap-2">
                           <p className="line-clamp-2 text-slate-300">
                               {styleState.analysisResult.detailed_review?.highlights || styleState.analysisResult.analysis || "点击查看详细分析报告..."}
                           </p>
                           <span className="text-[#ccff00] text-xs mt-2 inline-block">点击展开完整报告 &rarr;</span>
                       </div>
                   ) : (
                       "等待分析结果..."
                   )}
              </div>
          </div>

      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && styleState.analysisResult && (
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
                
                {renderAnalysisContent()}
                
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
      {showPraiseModal && (
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
                      {styleState.analysisResult?.coach_an_comment || styleState.analysisResult?.message || "\"你今天的穿搭简直太棒了！\""}
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
    </div>
  );
}
