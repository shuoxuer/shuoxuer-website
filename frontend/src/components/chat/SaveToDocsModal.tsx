import { useState, useEffect } from "react";
import axios from "axios";
import { Search, BookOpen, X, Save, CheckCircle } from "lucide-react";
import clsx from "clsx";

interface SaveToDocsModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysisContent: string;
}

export function SaveToDocsModal({ isOpen, onClose, analysisContent }: SaveToDocsModalProps) {
    const [docs, setDocs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadDocs();
        }
    }, [isOpen]);

    const loadDocs = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/v1/documentation");
            setDocs(res.data);
        } catch (error) {
            console.error("Failed to load docs", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocs = docs.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSave = async () => {
        if (!selectedDocId) return;
        setSaving(true);
        try {
            await axios.put(`/api/v1/documentation/${selectedDocId}/section`, {
                title: "详细说明",
                content: `### 视频分析案例 (${new Date().toLocaleDateString()})\n${analysisContent}`,
                append: true
            });
            alert("已成功添加至文档！");
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
            alert("保存失败");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-emerald-400" />
                        保存分析到文档
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜索文档条目..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 pl-9 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
                    {loading ? (
                        <div className="text-center py-4 text-slate-500 text-sm">加载中...</div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-sm">无匹配结果</div>
                    ) : (
                        filteredDocs.map(doc => (
                            <div 
                                key={doc.id}
                                onClick={() => setSelectedDocId(doc.id)}
                                className={clsx(
                                    "p-3 rounded-lg border cursor-pointer transition flex items-center justify-between",
                                    selectedDocId === doc.id 
                                        ? "bg-emerald-900/20 border-emerald-500/50" 
                                        : "bg-slate-950 border-slate-800 hover:border-slate-600"
                                )}
                            >
                                <div>
                                    <h4 className={clsx("text-sm font-bold", selectedDocId === doc.id ? "text-emerald-400" : "text-slate-300")}>
                                        {doc.title}
                                    </h4>
                                    <p className="text-xs text-slate-500">{doc.category}</p>
                                </div>
                                {selectedDocId === doc.id && (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                )}
                            </div>
                        ))
                    )}
                </div>

                <button 
                    onClick={handleSave}
                    disabled={!selectedDocId || saving}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center transition"
                >
                    {saving ? "保存中..." : "确认添加"}
                </button>
            </div>
        </div>
    );
}