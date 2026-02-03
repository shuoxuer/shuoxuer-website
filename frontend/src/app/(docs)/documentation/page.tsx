"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { BookOpen, Search, ChevronRight, ChevronDown, Menu, Activity, ThumbsUp, ThumbsDown, ChevronLeft, Folder, FileText, Home } from "lucide-react";
import Fuse from "fuse.js";
import clsx from "clsx";
import documentationData from "@/data/documentation.json";

export default function DocumentationPage() {
  // Use static data directly
  const [docs] = useState<any[]>(documentationData);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State definitions
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Tree state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate loading for better UX or just set false immediately
    // Initialize with first doc if available
    if (documentationData.length > 0) {
        const firstDoc = documentationData[0];
        const cat = firstDoc.category;
        const subCat = firstDoc.sections?.find((s: any) => s.title === "分类")?.content || "其他";
        
        // Set initial state
        setSelectedDoc(firstDoc);
        setSelectedCategory(cat);
        setSelectedSubCategory(subCat);
        
        // Auto-expand first doc's path
        setExpandedCategories(new Set([cat]));
        setExpandedSubCategories(new Set([`${cat}-${subCat}`]));
    }
    setLoading(false);
  }, []);

  // Configure Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(docs, {
      keys: ["title", "content", "tags", "category", "sections.title", "sections.content"],
      threshold: 0.3,
    });
  }, [docs]);

  // Filter Logic
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, docs]);

  // Group Docs into Tree Structure
  const docTree = useMemo(() => {
    const tree: Record<string, Record<string, any[]>> = {};

    filteredDocs.forEach(doc => {
        const category = doc.category || "未分类";
        // Extract sub-category from sections or use "其他"
        const subCategory = doc.sections?.find((s: any) => s.title === "分类")?.content || "其他";

        if (!tree[category]) {
            tree[category] = {};
        }
        if (!tree[category][subCategory]) {
            tree[category][subCategory] = [];
        }
        tree[category][subCategory].push(doc);
    });

    return tree;
  }, [filteredDocs]);

  // Navigation Handlers
  const handleRootClick = () => {
    setSelectedDoc(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedDoc(null);
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    
    // Auto expand
    const newSet = new Set(expandedCategories);
    newSet.add(category);
    setExpandedCategories(newSet);
  };

  const handleSubCategoryClick = (category: string, subCategory: string) => {
    setSelectedDoc(null);
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory);

    // Auto expand
    const catSet = new Set(expandedCategories);
    catSet.add(category);
    setExpandedCategories(catSet);

    const subSet = new Set(expandedSubCategories);
    subSet.add(`${category}-${subCategory}`);
    setExpandedSubCategories(subSet);
  };

  const handleDocClick = (doc: any) => {
    setSelectedDoc(doc);
    setSelectedCategory(doc.category);
    const subCat = doc.sections?.find((s: any) => s.title === "分类")?.content || "其他";
    setSelectedSubCategory(subCat);
  };

  // Toggle handlers
  const toggleCategory = (cat: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(cat)) {
        newSet.delete(cat);
    } else {
        newSet.add(cat);
    }
    setExpandedCategories(newSet);
  };

  const toggleSubCategory = (subCatKey: string) => {
    const newSet = new Set(expandedSubCategories);
    if (newSet.has(subCatKey)) {
        newSet.delete(subCatKey);
    } else {
        newSet.add(subCatKey);
    }
    setExpandedSubCategories(newSet);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-row overflow-hidden bg-slate-950 relative">
      {/* Sidebar Toggle Button (when closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white shadow-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Left Sidebar: Tree View */}
      <div 
        className={clsx(
            "bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-all duration-300 ease-in-out relative z-10",
            isSidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full opacity-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
            <Link href="/dashboard" className="flex items-center text-slate-400 hover:text-white transition group" title="返回总控台">
                <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700 mr-3">
                    <Home className="w-4 h-4 text-emerald-400" />
                </div>
            </Link>
            <h2 className="text-lg font-bold text-white flex items-center overflow-hidden whitespace-nowrap flex-1">
                <span className={clsx("transition-opacity duration-200", isSidebarOpen ? "opacity-100" : "opacity-0")}>
                    文档中心
                </span>
            </h2>
            <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
        </div>

        {/* Search */}
        <div className={clsx("p-4 transition-opacity duration-200 shrink-0", isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500" />
                </div>
                <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-9 p-2 placeholder-slate-500"
                    placeholder="搜索文档..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {Object.keys(docTree).map(category => (
                <div key={category} className="mb-1">
                    {/* Level 1: Category */}
                    <div className="flex items-center w-full group">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleCategory(category); }}
                            className="p-2 text-slate-500 hover:text-white transition"
                        >
                            {expandedCategories.has(category) ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleCategoryClick(category)}
                            className={clsx(
                                "flex-1 text-left py-2 pr-2 text-sm font-bold transition flex items-center justify-between rounded-r-lg",
                                selectedCategory === category && !selectedSubCategory && !selectedDoc
                                    ? "text-emerald-400 bg-slate-800" 
                                    : "text-slate-300 hover:bg-slate-800"
                            )}
                        >
                            <span>{category}</span>
                            <span className="text-xs text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                                {Object.values(docTree[category]).reduce((acc, curr) => acc + curr.length, 0)}
                            </span>
                        </button>
                    </div>

                    {/* Level 2: Sub-Categories */}
                    {expandedCategories.has(category) && (
                        <div className="ml-2 pl-2 border-l border-slate-800 mt-1 space-y-1">
                            {Object.keys(docTree[category]).map(subCategory => {
                                const subCatKey = `${category}-${subCategory}`;
                                const items = docTree[category][subCategory];
                                
                                return (
                                    <div key={subCatKey}>
                                        <div className="flex items-center w-full group">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleSubCategory(subCatKey); }}
                                                className="p-2 text-slate-600 hover:text-slate-300 transition"
                                            >
                                                {expandedSubCategories.has(subCatKey) ? (
                                                    <ChevronDown className="w-3 h-3" />
                                                ) : (
                                                    <ChevronRight className="w-3 h-3" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleSubCategoryClick(category, subCategory)}
                                                className={clsx(
                                                    "flex-1 text-left py-2 pr-2 text-xs font-medium transition rounded-r-md",
                                                    selectedCategory === category && selectedSubCategory === subCategory && !selectedDoc
                                                        ? "text-emerald-400 bg-slate-800/50"
                                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                                )}
                                            >
                                                {subCategory}
                                            </button>
                                        </div>

                                        {/* Level 3: Docs */}
                                        {expandedSubCategories.has(subCatKey) && (
                                            <div className="ml-4 pl-2 border-l border-slate-800/50 mt-1 space-y-0.5">
                                                {items.map(doc => (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => handleDocClick(doc)}
                                                        className={clsx(
                                                            "w-full text-left px-3 py-1.5 rounded-md text-xs transition flex items-center truncate",
                                                            selectedDoc?.id === doc.id
                                                                ? "text-emerald-400 bg-emerald-900/10 font-medium"
                                                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                                                        )}
                                                    >
                                                        <FileText className="w-3 h-3 mr-2 shrink-0 opacity-50" />
                                                        <span className="truncate">{doc.title.split("(")[0]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
            
            {Object.keys(docTree).length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                    未找到相关文档
                </div>
            )}
        </div>
      </div>

      {/* Right Content Area: Detail View */}
      <div className="flex-1 h-full overflow-y-auto bg-white text-slate-900 w-full">
        {selectedDoc ? (
            <div className="max-w-4xl mx-auto p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions (Breadcrumbs) */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-500 pl-12 md:pl-0 flex-wrap">
                        <button onClick={handleRootClick} className="flex items-center hover:text-emerald-600 cursor-pointer transition whitespace-nowrap">
                            <BookOpen className="w-4 h-4 mr-1" /> 文档中心
                        </button>
                        <span>/</span>
                        <button 
                            onClick={() => handleCategoryClick(selectedDoc.category)}
                            className="font-medium text-slate-700 whitespace-nowrap hover:text-emerald-600 transition"
                        >
                            {selectedDoc.category}
                        </button>
                        
                        {selectedSubCategory && (
                            <>
                                <span>/</span>
                                <button 
                                    onClick={() => handleSubCategoryClick(selectedDoc.category, selectedSubCategory)}
                                    className="font-medium text-slate-700 whitespace-nowrap hover:text-emerald-600 transition"
                                >
                                    {selectedSubCategory}
                                </button>
                            </>
                        )}
                        <span>/</span>
                        <span className="font-medium text-slate-900 whitespace-nowrap">{selectedDoc.title}</span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0 ml-4">
                         <div className="flex items-center bg-slate-100 rounded-md p-1">
                            <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm rounded transition flex items-center">
                                <ThumbsUp className="w-3 h-3 mr-1" /> 有用
                            </button>
                            <div className="w-px h-3 bg-slate-300 mx-1"></div>
                            <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm rounded transition flex items-center">
                                <ThumbsDown className="w-3 h-3 mr-1" /> 无用
                            </button>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                    {selectedDoc.title}
                </h1>

                {/* Meta Info */}
                <div className="flex items-center space-x-4 mb-8">
                    <span className={clsx(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        selectedDoc.level === "核心" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        selectedDoc.level === "进阶" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                    )}>
                        {selectedDoc.level}
                    </span>
                    <span className="text-sm text-slate-500">最后更新：2026-02-03</span>
                </div>

                {/* Content Body */}
                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-600">
                    <p className="text-lg leading-relaxed text-slate-600 mb-8 border-l-4 border-emerald-500 pl-4 bg-slate-50 p-4 rounded-r-lg">
                        {selectedDoc.content}
                    </p>

                    {/* Dynamic Sections from JSON */}
                    {selectedDoc.sections && selectedDoc.sections.map((section: any, idx: number) => {
                        // Skip "分类" section as it's used in breadcrumbs
                        if (section.title === "分类") return null;
                        
                        // Customize "相关条目ID" section
                        if (section.title === "相关条目ID") {
                            return (
                                <div key={idx} className="mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                                        相关视频文章
                                    </h3>
                                    <div className="text-slate-400 italic bg-slate-50 border border-slate-100 p-4 rounded-lg shadow-sm">
                                        暂无
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                                    {section.title}
                                </h3>
                                <div className="text-slate-600 leading-relaxed bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
                                    {section.content}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer / Tags */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            {selectedDoc.tags.map((tag: string) => (
                                <span key={tag} className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ) : selectedSubCategory && selectedCategory ? (
            // Sub-Category View (List of Docs)
            <div className="max-w-4xl mx-auto p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-500 pl-12 md:pl-0 flex-wrap">
                        <button onClick={handleRootClick} className="flex items-center hover:text-emerald-600 cursor-pointer transition whitespace-nowrap">
                            <BookOpen className="w-4 h-4 mr-1" /> 文档中心
                        </button>
                        <span>/</span>
                        <button 
                            onClick={() => handleCategoryClick(selectedCategory)}
                            className="font-medium text-slate-700 whitespace-nowrap hover:text-emerald-600 transition"
                        >
                            {selectedCategory}
                        </button>
                        <span>/</span>
                        <span className="font-medium text-slate-900 whitespace-nowrap">{selectedSubCategory}</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{selectedSubCategory}</h1>
                <p className="text-slate-500 mb-8">该分类下的所有文档</p>

                <div className="grid gap-4 md:grid-cols-2">
                    {docTree[selectedCategory]?.[selectedSubCategory]?.map(doc => (
                        <button 
                            key={doc.id}
                            onClick={() => handleDocClick(doc)}
                            className="text-left p-6 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition group"
                        >
                            <h3 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition">{doc.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{doc.content}</p>
                            <div className="flex flex-wrap gap-1">
                                {doc.tags?.slice(0, 3).map((tag: string) => (
                                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        ) : selectedCategory ? (
            // Category View (List of SubCategories)
            <div className="max-w-4xl mx-auto p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-500 pl-12 md:pl-0 flex-wrap">
                        <button onClick={handleRootClick} className="flex items-center hover:text-emerald-600 cursor-pointer transition whitespace-nowrap">
                            <BookOpen className="w-4 h-4 mr-1" /> 文档中心
                        </button>
                        <span>/</span>
                        <span className="font-medium text-slate-900 whitespace-nowrap">{selectedCategory}</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{selectedCategory}</h1>
                <p className="text-slate-500 mb-8">该篇章包含以下分类</p>

                <div className="grid gap-4 md:grid-cols-2">
                    {Object.keys(docTree[selectedCategory] || {}).map(subCat => (
                         <button 
                            key={subCat}
                            onClick={() => handleSubCategoryClick(selectedCategory, subCat)}
                            className="text-left p-6 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition">{subCat}</h3>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">
                                    {docTree[selectedCategory][subCat].length} 篇
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2">
                                包含 {docTree[selectedCategory][subCat].map(d => d.title.split('(')[0]).join('、')} 等...
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            // Root View (List of Categories)
            <div className="max-w-4xl mx-auto p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                     <span className="flex items-center font-bold text-slate-900 whitespace-nowrap">
                        <BookOpen className="w-4 h-4 mr-2 text-emerald-500" /> 文档中心
                    </span>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">欢迎来到羽球智能私教文档库</h1>
                <p className="text-lg text-slate-600 mb-12">这里汇集了从基础技术到高阶战术的全方位羽毛球知识，助您科学训练，快速进阶。</p>

                <div className="grid gap-6 md:grid-cols-2">
                    {Object.keys(docTree).map(category => (
                         <button 
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className="text-left p-6 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                                <Folder className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition">{category}</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    共 {Object.values(docTree[category]).reduce((acc, curr) => acc + curr.length, 0)} 篇文档
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(docTree[category]).slice(0, 4).map(sub => (
                                        <span key={sub} className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">
                                            {sub}
                                        </span>
                                    ))}
                                    {Object.keys(docTree[category]).length > 4 && (
                                        <span className="text-xs text-slate-400 px-1 py-1">...</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
