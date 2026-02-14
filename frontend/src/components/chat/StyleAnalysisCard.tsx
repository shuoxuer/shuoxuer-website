"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Heart, Camera, Download } from "lucide-react";
import { toPng } from 'html-to-image';
import { useRef } from 'react';

import { useRouter } from 'next/navigation';

interface StyleAnalysisProps {
    totalScore: number;
    radarData: any; // Can be array or object from backend
    coachAnComment: string;
    tags: string[];
    archiveId?: string; // Optional for linking
}

const DIMENSION_MAP: Record<string, { label: string; fullMark: number }> = {
    "function_fit": { label: "功能匹配", fullMark: 20 },
    "silhouette": { label: "身材修饰", fullMark: 20 },
    "color_harmony": { label: "配色协调", fullMark: 15 },
    "material_detail": { label: "质感细节", fullMark: 15 },
    "style_identity": { label: "风格辨识", fullMark: 15 },
    "camera_presence": { label: "上镜表现", fullMark: 15 }
};

export function StyleAnalysisCard({ totalScore, radarData, coachAnComment, tags, archiveId }: StyleAnalysisProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Transform data if it's an object (from LLM) to array (for Recharts)
  const chartData = Array.isArray(radarData) ? radarData : Object.keys(DIMENSION_MAP).map(key => ({
      subject: DIMENSION_MAP[key].label,
      A: radarData?.[key] || 0,
      fullMark: DIMENSION_MAP[key].fullMark
  }));

  const handleExport = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent navigation when clicking export
      if (!cardRef.current) return;
      try {
          const dataUrl = await toPng(cardRef.current, {
              backgroundColor: '#0f172a', // slate-900
              pixelRatio: 2,
              filter: (node) => {
                  const element = node as HTMLElement;
                  return element.tagName !== 'BUTTON';
              }
          });
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `style-analysis-${Date.now()}.png`;
          a.click();
      } catch (err) {
          console.error("Export failed:", err);
      }
  };

  const handleClick = () => {
      if (archiveId) {
          router.push(`/archives/${archiveId}`);
      }
  };

  return (
    <div 
        ref={cardRef} 
        onClick={handleClick}
        className={`w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-left flex flex-col md:flex-row relative group ${archiveId ? 'cursor-pointer hover:border-pink-500/50 transition-colors' : ''}`}
    >
      {/* Export Button (Visible on hover) */}
      <button 
          onClick={handleExport}
          className="absolute top-2 right-2 p-2 bg-slate-800/80 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition opacity-0 group-hover:opacity-100 z-10"
          title="导出报告"
      >
          <Download className="w-4 h-4" />
      </button>

      {/* Left: Radar Chart */}
      <div className="flex-1 p-4 flex items-center justify-center bg-slate-950/30 relative">
          <div className="absolute top-2 left-2 flex items-center text-slate-500 text-xs">
              <Camera className="w-3 h-3 mr-1" /> 风格指数
          </div>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
                    <Radar
                        name="分数"
                        dataKey="A"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.5}
                    />
                </RadarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Right: Score & Comment */}
      <div className="flex-1 p-6 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-800">
          <div className="mb-4">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">穿搭评分</h3>
              <div className="text-5xl font-black text-white flex items-baseline">
                  {totalScore} <span className="text-xl text-slate-500 ml-1 font-normal">分</span>
              </div>
          </div>

          <div className="bg-pink-500/10 border border-pink-500/20 p-3 rounded-lg mb-4">
              <div className="flex items-center mb-1 text-pink-400 text-xs font-bold">
                  <Heart className="w-3 h-3 mr-1" /> 小安点评
              </div>
              <p className="text-sm text-pink-100 italic leading-relaxed">
                  "{coachAnComment}"
              </p>
          </div>

          <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      #{tag}
                  </span>
              ))}
          </div>
      </div>
    </div>
  );
}
