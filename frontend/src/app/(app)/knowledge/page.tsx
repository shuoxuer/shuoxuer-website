"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, BrainCircuit, Tag, BookOpen, Clock, CheckCircle, Trash2, XCircle, Plus, Edit2, X, Save } from "lucide-react";
import ReactECharts from 'echarts-for-react';
import clsx from "clsx";

export default function KnowledgeBase() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [graphOption, setGraphOption] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ content: "", tags: "", status: "pending" });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const [listRes] = await Promise.all([
            axios.get("/api/v1/knowledge/list") 
        ]);
        setEntries(listRes.data);
        generateGraph(listRes.data.filter((i: any) => i.status === 'approved'));
    } catch (error) {
        console.error("Failed to load knowledge base:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("确定要删除这条知识吗？")) return;
      try {
          await axios.delete(`/api/v1/knowledge/${id}`);
          setEntries(prev => prev.filter(e => e.id !== id));
          loadData(); // Reload to refresh graph
      } catch (error) {
          console.error("Delete failed:", error);
          alert("删除失败");
      }
  };

  const handleEdit = (item: any) => {
      setEditingItem(item);
      setFormData({
          content: item.content,
          tags: item.tags ? item.tags.join(", ") : "",
          status: item.status
      });
      setIsModalOpen(true);
  };

  const handleAdd = () => {
      setEditingItem(null);
      setFormData({ content: "", tags: "", status: "approved" }); // Default to approved for manual add
      setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!formData.content.trim()) {
          alert("内容不能为空");
          return;
      }

      const tagsList = formData.tags.split(/[,，]/).map(t => t.trim()).filter(t => t);

      try {
          if (editingItem) {
              // Update
              await axios.put(`/api/v1/knowledge/${editingItem.id}`, {
                  content: formData.content,
                  tags: tagsList,
                  status: formData.status
              });
          } else {
              // Add New
              // Currently using /add endpoint which adds as pending by default, 
              // but we might want to support adding as approved directly if user is admin.
              // For now, let's use the existing add and then auto-approve if needed or just let it be pending.
              // But wait, the backend add endpoint doesn't accept status.
              // Let's just add it first.
              const res = await axios.post("/api/v1/knowledge/add", {
                  content: formData.content,
                  tags: tagsList,
                  source: "MANUAL"
              });
              
              // If we want it to be approved immediately (since it's manual), we can call approve
              if (formData.status === 'approved') {
                  await axios.put(`/api/v1/knowledge/${res.data.id}/approve`);
              }
          }
          
          setIsModalOpen(false);
          loadData();
      } catch (error) {
          console.error("Save failed:", error);
          alert("保存失败");
      }
  };

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) {
          loadData();
          return;
      }
      
      setLoading(true);
      try {
          const res = await axios.post("/api/v1/knowledge/search", { query });
          setEntries(res.data);
      } catch (error) {
          console.error("Search failed:", error);
      } finally {
          setLoading(false);
      }
  };

  const generateGraph = (data: any[]) => {
      const nodes: any[] = [];
      const links: any[] = [];
      const tagSet = new Set<string>();
      const entryIds = new Set<string>();

      data.forEach(item => {
          const nodeId = `entry-${item.id}`;
          if (entryIds.has(nodeId)) return;
          entryIds.add(nodeId);

          const shortContent = item.content.length > 20 ? item.content.substring(0, 20) + '...' : item.content;

          nodes.push({
              id: nodeId,
              name: nodeId,
              label: { 
                  show: data.length < 50,
                  formatter: shortContent,
                  fontSize: 10,
                  color: '#94a3b8' 
              },
              tooltip: {
                  formatter: item.content
              },
              symbolSize: 15,
              category: 1,
              itemStyle: { color: '#475569' }
          });

          if (item.tags && item.tags.length > 0) {
              item.tags.forEach((tag: string) => {
                  tagSet.add(tag);
                  links.push({
                      source: tag,
                      target: nodeId
                  });
              });
          } else {
              tagSet.add("未分类");
              links.push({
                  source: "未分类",
                  target: nodeId
              });
          }
      });

      tagSet.forEach(tag => {
          nodes.push({
              id: tag,
              name: tag,
              symbolSize: 40,
              category: 0,
              itemStyle: { color: '#10b981' },
              label: { show: true, fontWeight: 'bold', color: '#fff' },
              tooltip: { formatter: `标签: ${tag}` }
          });
      });

      const option = {
        title: { text: '知识关联图谱', textStyle: { color: '#ccc', fontSize: 14 } },
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#e2e8f0' }
        },
        legend: {
            data: [{ name: '知识标签', icon: 'circle' }, { name: '知识条目', icon: 'circle' }],
            textStyle: { color: '#94a3b8' },
            bottom: 0
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            data: nodes,
            links: links,
            categories: [
                { name: '知识标签' },
                { name: '知识条目' }
            ],
            roam: true,
            label: {
              position: 'right',
              formatter: '{b}'
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3,
              opacity: 0.5
            },
            force: {
                repulsion: 300,
                edgeLength: 100,
                gravity: 0.1
            }
          }
        ]
      };
      setGraphOption(option);
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <BrainCircuit className="mr-3 text-emerald-400" /> 知识库中心
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI 驱动的智能羽毛球知识体系</p>
        </div>
        <button 
            onClick={handleAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center transition shadow-lg shadow-emerald-900/20"
        >
            <Plus className="w-5 h-5 mr-2" />
            手动添加知识
        </button>
      </div>

      {/* Search & Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索知识点 (支持语义检索)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 pl-12 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                  <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                  <button type="submit" className="absolute right-2 top-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-500 transition">
                      搜索
                  </button>
              </form>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px]">
                  {loading ? (
                      <div className="text-center py-10 text-slate-500">搜索中...</div>
                  ) : entries.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                          暂无相关知识条目
                      </div>
                  ) : (
                      entries.map((item) => (
                          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group relative">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                      <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono">
                                          {item.id}
                                      </span>
                                      {item.status === 'approved' && (
                                          <span className="text-xs text-emerald-500 flex items-center">
                                              <CheckCircle className="w-3 h-3 mr-1" /> 已审核
                                          </span>
                                      )}
                                      {item.status === 'pending' && (
                                          <span className="text-xs text-yellow-500 flex items-center">
                                              <Clock className="w-3 h-3 mr-1" /> 待审核
                                          </span>
                                      )}
                                      {item.status === 'rejected' && (
                                          <span className="text-xs text-red-500 flex items-center">
                                              <XCircle className="w-3 h-3 mr-1" /> 已拒绝
                                          </span>
                                      )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                          onClick={() => handleEdit(item)}
                                          className="text-slate-500 hover:text-white p-1.5 rounded hover:bg-slate-800 transition"
                                          title="编辑"
                                      >
                                          <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                          onClick={() => handleDelete(item.id)}
                                          className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition"
                                          title="删除"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                                  {item.content}
                              </p>
                              {item.tags && item.tags.length > 0 && (
                                  <div className="flex gap-2 flex-wrap">
                                      {item.tags.map((tag: string, idx: number) => (
                                          <span key={idx} className="flex items-center text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                              <Tag className="w-3 h-3 mr-1" /> {tag}
                                          </span>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Graph Visualization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h3 className="text-slate-400 font-bold mb-4 text-sm uppercase tracking-wider">知识关联图谱</h3>
              <div className="flex-1 min-h-[300px] flex items-center justify-center bg-slate-950/30 rounded-lg overflow-hidden">
                  {graphOption ? (
                      <ReactECharts option={graphOption} style={{ height: '100%', width: '100%' }} />
                  ) : (
                      <span className="text-slate-600 text-sm">暂无足够数据生成图谱</span>
                  )}
              </div>
              <div className="mt-4 text-xs text-slate-500 text-center">
                  * 展示基于标签共现的知识关联
              </div>
          </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">
                          {editingItem ? "编辑知识条目" : "手动添加知识"}
                      </h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase mb-2">知识内容</label>
                          <textarea 
                              value={formData.content}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition resize-none"
                              placeholder="请输入详细的知识内容..."
                          />
                      </div>
                      
                      <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase mb-2">关联标签 (用逗号分隔)</label>
                          <input 
                              type="text" 
                              value={formData.tags}
                              onChange={(e) => setFormData({...formData, tags: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                              placeholder="例如: 杀球, 步法, 战术"
                          />
                      </div>

                      <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase mb-2">状态</label>
                          <select 
                              value={formData.status}
                              onChange={(e) => setFormData({...formData, status: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                          >
                              <option value="pending">待审核 (Pending)</option>
                              <option value="approved">已发布 (Approved)</option>
                              <option value="rejected">已拒绝 (Rejected)</option>
                          </select>
                      </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                      <button 
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-lg font-bold hover:bg-slate-700 transition"
                      >
                          取消
                      </button>
                      <button 
                          onClick={handleSave}
                          className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 transition flex items-center justify-center"
                      >
                          <Save className="w-4 h-4 mr-2" /> 保存
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
