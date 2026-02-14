import { Activity } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  component?: React.ReactNode;
}

export function MessageBubble({ role, content, component }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={clsx("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx("flex max-w-3xl gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isUser ? "bg-slate-700" : "bg-yellow-400 text-black"
        )}>
            {isUser ? "U" : <Activity className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className={clsx("flex flex-col gap-2 min-w-0 w-full", isUser ? "items-end" : "items-start")}>
            {/* Text Bubble */}
            {content && (
                <div className={clsx(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed prose prose-invert max-w-none",
                    isUser ? "bg-slate-800 text-white rounded-tr-none" : "text-slate-200"
                )}>
                    {isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}
                </div>
            )}
            
            {/* Custom Component (Report Cards) */}
            {component && (
                <div className="w-full mt-2">
                    {component}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
