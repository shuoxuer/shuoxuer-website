"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface StyleRadarChartProps {
  data: {
    function_fit: number;
    silhouette: number;
    color_harmony: number;
    material_detail: number;
    style_identity: number;
    camera_presence: number;
  };
}

export default function StyleRadarChart({ data }: StyleRadarChartProps) {
  const chartData = [
    { subject: "功能适配", A: data.function_fit, fullMark: 20 },
    { subject: "身材修饰", A: data.silhouette, fullMark: 20 },
    { subject: "配色协调", A: data.color_harmony, fullMark: 15 },
    { subject: "质感细节", A: data.material_detail, fullMark: 15 },
    { subject: "风格辨识", A: data.style_identity, fullMark: 15 },
    { subject: "上镜表现", A: data.camera_presence, fullMark: 15 },
  ];

  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#4b5563" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
          <Radar
            name="Style Score"
            dataKey="A"
            stroke="#ccff00"
            strokeWidth={2}
            fill="#ccff00"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
