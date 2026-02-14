import { Play, AlertCircle, Dumbbell, Download, BookPlus } from "lucide-react";
import clsx from "clsx";
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SaveToDocsModal } from "./SaveToDocsModal";

interface CoachComment {
    coach: "Hu" | "Li" | "An";
    name: string;
    role: string;
    avatarColor: string;
    comment: string;
}

interface VideoAnalysisProps {
    videoInfo: {
        duration: string;
        type: string; // e.g. "Smash Practice"
    };
    coaches: CoachComment[];
    issues: { tag: string; severity: "high" | "medium" | "low" }[];
    archiveId?: string;
}

export function VideoAnalysisCard({ videoInfo, coaches, issues, archiveId }: VideoAnalysisProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // Generate HTML Content
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>视频分析报告 - ${videoInfo.type}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f8fafc; color: #334155; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0f172a; color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 20px; font-weight: bold; margin: 0; }
        .meta { color: #94a3b8; font-size: 14px; margin-top: 4px; }
        .badge { background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; font-family: monospace; }
        .content { padding: 24px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .coach-card { background: #f1f5f9; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .coach-header { display: flex; align-items: center; margin-bottom: 12px; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 12px; }
        .avatar.Li { background: #a855f7; }
        .avatar.An { background: #ec4899; }
        .coach-name { font-weight: bold; font-size: 14px; color: #1e293b; }
        .coach-role { font-size: 12px; color: #64748b; }
        .comment { font-size: 14px; line-height: 1.6; color: #475569; }
        .section-title { font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; }
        .tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { font-size: 12px; padding: 4px 12px; border-radius: 4px; border: 1px solid transparent; }
        .tag.high { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }
        .tag.medium { background: #fefce8; color: #eab308; border-color: #fef9c3; }
        .tag.low { background: #eff6ff; color: #3b82f6; border-color: #dbeafe; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div>
                <h1 class="title">${videoInfo.type}</h1>
                <p class="meta">时长: ${videoInfo.duration} | 生成时间: ${new Date().toLocaleString()}</p>
            </div>
            <div class="badge">AI 分析报告</div>
        </div>
        
        <div class="content">
            <div class="section-title">教练点评</div>
            <div class="grid">
                ${coaches.map(coach => `
                <div class="coach-card">
                    <div class="coach-header">
                        <div class="avatar ${coach.coach}">${coach.coach[0]}</div>
                        <div>
                            <div class="coach-name">${coach.name}</div>
                            <div class="coach-role">${coach.role}</div>
                        </div>
                    </div>
                    <div class="comment">"${coach.comment}"</div>
                </div>
                `).join('')}
            </div>

            <div class="section-title">核心问题</div>
            <div class="tags">
                ${issues.map(issue => `
                <span class="tag ${issue.severity}">${issue.tag}</span>
                `).join('')}
            </div>
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
      a.download = `video-analysis-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleClick = () => {
      if (archiveId) {
          router.push(`/archives/${archiveId}`);
      }
  };

  const handleOpenDocsModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDocsModalOpen(true);
  };

  // Prepare content for saving to docs
  const getAnalysisContent = () => {
      let content = "";
      const hu = coaches.find(c => c.coach === "Hu")?.comment;
      if (hu) content += `**技术指导**: ${hu}\n`;
      if (issues.length > 0) {
          content += `**常见问题**:\n${issues.map(i => `- ${i.tag}`).join("\n")}`;
      }
      return content;
  };

  return (
    <>
    <div 
        ref={cardRef} 
        onClick={handleClick}
        className={`w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-left relative group ${archiveId ? 'cursor-pointer hover:border-blue-500/50 transition-colors' : ''}`}
    >
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition">
          <button 
              onClick={handleOpenDocsModal}
              className="p-2 bg-slate-950/80 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 border border-slate-800"
              title="添加到文档库"
          >
              <BookPlus className="w-4 h-4" />
          </button>
          <button 
              onClick={handleExport}
              className="p-2 bg-slate-950/80 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              title="导出报告"
          >
              <Download className="w-4 h-4" />
          </button>
      </div>

      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
              <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400">
                  <Play className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="font-bold text-white text-sm">{videoInfo.type}</h3>
                  <p className="text-xs text-slate-500">时长: {videoInfo.duration}</p>
              </div>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded">
              已分析
          </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/50">
          {coaches.map((coach, i) => (
              <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex items-center mb-2">
                      <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 text-white", coach.avatarColor)}>
                          {coach.coach[0]}
                      </div>
                      <div>
                          <p className="text-xs font-bold text-slate-200">{coach.name}</p>
                          <p className="text-[10px] text-slate-500">{coach.role}</p>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                      "{coach.comment}"
                  </p>
              </div>
          ))}
      </div>

      {/* Tags Section */}
      <div className="p-4 pt-0">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> 核心问题
          </h4>
          <div className="flex flex-wrap gap-2">
              {issues.map((issue, i) => (
                  <span key={i} className={clsx(
                      "text-xs px-2 py-1 rounded border",
                      issue.severity === 'high' ? "bg-red-900/20 text-red-400 border-red-900/50" : 
                      issue.severity === 'medium' ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/50" :
                      "bg-blue-900/20 text-blue-400 border-blue-900/50"
                  )}>
                      {issue.tag}
                  </span>
              ))}
          </div>
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition text-sm">
              <Dumbbell className="w-4 h-4 mr-2" />
              生成专项训练计划
          </button>
      </div>
    </div>
    
    <SaveToDocsModal 
        isOpen={isDocsModalOpen} 
        onClose={() => setIsDocsModalOpen(false)}
        analysisContent={getAnalysisContent()}
    />
    </>
  );
}
