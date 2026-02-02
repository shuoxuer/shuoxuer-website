import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
      <div className="mb-8">
        <Activity className="h-16 w-16 text-yellow-400 mx-auto" />
      </div>
      <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
        羽球智能私教 <span className="text-yellow-400">AI</span>
      </h1>
      <p className="text-xl text-slate-400 max-w-2xl mb-10">
        您的私人 AI 教练团队。胡教练分析技术，李指导制定战术，小安提供心理支持。
        <br />
        全方位提升您的羽毛球水平。
      </p>
      
      <div className="flex space-x-4">
        <Link 
          href="/dashboard" 
          className="px-8 py-3 bg-yellow-400 text-slate-900 font-bold rounded-full text-lg hover:bg-yellow-300 transition flex items-center"
        >
          开始训练 <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
        <button className="px-8 py-3 bg-slate-800 text-white font-bold rounded-full text-lg hover:bg-slate-700 transition">
          了解更多
        </button>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full">
        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-2">精准动作分析</h3>
          <p className="text-slate-400 text-sm">基于 Gemini AI 的视觉识别，精确捕捉每一个关节角度与发力细节。</p>
        </div>
        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-2">个性化战术指导</h3>
          <p className="text-slate-400 text-sm">根据您的打法风格，制定专属战术策略，扬长避短。</p>
        </div>
        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-2">穿搭风尚点评</h3>
          <p className="text-slate-400 text-sm">不仅要打得好，还要穿得帅。AI 专属 OOTD 评分与建议。</p>
        </div>
      </div>
    </div>
  );
}
