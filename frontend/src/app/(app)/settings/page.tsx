"use client";

import { useState } from "react";
import { Settings, User, Activity, Shield, HelpCircle } from "lucide-react";
import clsx from "clsx";

export default function SettingsPage() {
  const [huSeverity, setHuSeverity] = useState(5);
  const [liStyle, setLiStyle] = useState("conservative"); // 'conservative' or 'aggressive'

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Settings className="mr-3 text-slate-400" />
        设置中心
      </h1>
      
      <div className="space-y-8">
        {/* Section A: Body & Sport Metrics */}
        <section>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                <User className="w-4 h-4 mr-2" /> 身体与运动参数
             </h2>
             <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-slate-300 mb-2 font-medium">惯用手</label>
                    <div className="flex space-x-4">
                        <label className="flex-1 flex items-center justify-center p-3 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer hover:border-yellow-400 transition">
                            <input type="radio" name="hand" className="mr-2 accent-yellow-400" defaultChecked />
                            <span className="text-white">右手</span>
                        </label>
                        <label className="flex-1 flex items-center justify-center p-3 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer hover:border-yellow-400 transition">
                            <input type="radio" name="hand" className="mr-2 accent-yellow-400" />
                            <span className="text-white">左手</span>
                        </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">决定 AI 分析时的方向判定，避免误判。</p>
                </div>
                
                <div>
                    <label className="block text-sm text-slate-300 mb-2 font-medium">主项偏好</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400">
                        <option>单打</option>
                        <option>双打 - 前场</option>
                        <option>双打 - 后场</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm text-slate-300 mb-2 font-medium">伤病历史 (多选)</label>
                    <div className="flex flex-wrap gap-2">
                        {["膝盖前交叉韧带", "手腕腱鞘炎", "腰肌劳损", "跟腱炎", "肩袖损伤"].map((injury) => (
                            <label key={injury} className="inline-flex items-center px-4 py-2 rounded-full border border-slate-700 bg-slate-800 cursor-pointer hover:bg-slate-700 transition">
                                <input type="checkbox" className="mr-2 accent-red-500 rounded" />
                                <span className="text-sm text-slate-300">{injury}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-orange-400/80">AI 在给出建议时会触发安全保护机制，避免加重伤病。</p>
                </div>
             </div>
        </section>

        {/* Section B: Coach Tuning */}
        <section>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2" /> AI 教练调校
             </h2>
             <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <div>
                        <span className="block text-white font-medium mb-1">默认教练</span>
                        <span className="text-xs text-slate-500">打开分析报告时第一个说话的人</span>
                    </div>
                    <select className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                        <option>胡教练 (技术严谨)</option>
                        <option>李指导 (战术大师)</option>
                        <option>小安 (热情鼓励)</option>
                    </select>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-white font-medium">胡教练严厉度</span>
                        <span className="text-yellow-400 text-lg font-bold">{huSeverity} <span className="text-sm text-slate-500 font-normal">/ 10</span></span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1"
                        value={huSeverity}
                        onChange={(e) => setHuSeverity(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" 
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>温和鼓励 (0)</span>
                        <span>平衡专业 (5)</span>
                        <span>魔鬼训练 (10)</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div>
                        <span className="block text-white font-medium mb-1">李指导风格</span>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
                        <button 
                            onClick={() => setLiStyle("conservative")}
                            className={clsx(
                                "px-4 py-1.5 rounded text-xs font-bold transition-all",
                                liStyle === "conservative" 
                                    ? "bg-slate-800 text-white shadow" 
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            保守稳健
                        </button>
                        <button 
                            onClick={() => setLiStyle("aggressive")}
                            className={clsx(
                                "px-4 py-1.5 rounded text-xs font-bold transition-all",
                                liStyle === "aggressive" 
                                    ? "bg-slate-800 text-white shadow" 
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            冒险激进
                        </button>
                    </div>
                </div>
             </div>
        </section>

        {/* Section C: Privacy & Data */}
        <section>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2" /> 隐私与数据
             </h2>
             <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
                 <div className="flex items-center justify-between">
                     <div>
                         <h3 className="text-white font-medium">视频留存策略</h3>
                         <p className="text-xs text-slate-500 mt-1">决定您上传视频的保存方式</p>
                     </div>
                     <select className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                        <option>永久保存</option>
                        <option>分析即焚 (仅保留报告)</option>
                        <option>仅保留精彩片段</option>
                    </select>
                 </div>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                     <div>
                         <h3 className="text-white font-medium">数据贡献</h3>
                         <p className="text-xs text-slate-500 mt-1">允许匿名化数据用于模型优化</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                     </label>
                 </div>
             </div>
        </section>
      </div>
    </div>
  );
}
