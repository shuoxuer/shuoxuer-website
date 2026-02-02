"use client";

import React, { useState } from "react";
import { X, ExternalLink, Activity } from "lucide-react";

interface InsightCardProps {
  tag: string;
  severity: "high" | "medium" | "low";
  diagnosis: string;
  principle: string;
  drill: string;
  resourceLink?: string;
}

export default function InsightCard({
  tag,
  severity,
  diagnosis,
  principle,
  drill,
  resourceLink,
}: InsightCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const severityColor = {
    high: "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30",
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-3 py-1 rounded-full text-sm font-medium border transition-all cursor-pointer ${severityColor[severity]}`}
      >
        {tag}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#ccff00]" />
                <h3 className="text-lg font-bold text-white">{tag}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Diagnosis */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  现象描述 (Diagnosis)
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{diagnosis}</p>
              </div>

              {/* Principle */}
              <div className="bg-gray-800/50 p-3 rounded-lg border-l-2 border-[#ccff00]">
                <h4 className="text-xs uppercase tracking-wider text-[#ccff00] font-semibold mb-1">
                  核心原理 (Principle)
                </h4>
                <p className="text-gray-400 text-sm">{principle}</p>
              </div>

              {/* Drill */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  推荐训练 (Drill)
                </h4>
                <div className="flex items-start gap-3 bg-gray-800 p-3 rounded-lg">
                  <div className="min-w-[4px] h-full bg-blue-500 rounded-full" />
                  <p className="text-white text-sm font-medium">{drill}</p>
                </div>
              </div>

              {/* Resource Link */}
              {resourceLink && (
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(resourceLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[#ccff00] hover:underline"
                  >
                    查看教学资源 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
