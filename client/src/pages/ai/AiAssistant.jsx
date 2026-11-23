import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Bot,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';

export const AiAssistant = () => {
  const [kbArticles, setKbArticles] = useState([]);
  const [loadingKb, setLoadingKb] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testInput, setTestInput] = useState('Do you have any 4 BHK penthouses available in Gurugram under 20 Cr?');
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // New Article Form
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'FAQ',
    content: '',
    tags: 'Pricing, Booking'
  });

  const { addToast } = useToast();

  const fetchKnowledgeBase = async () => {
    setLoadingKb(true);
    try {
      const res = await api.get('/ai/knowledge-base');
      if (res.data.success) {
        setKbArticles(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingKb(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const handleTestChat = async (e) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await api.post('/ai/chat', { message: testInput });
      if (res.data.success) {
        setTestResponse(res.data.result);
      }
    } catch (err) {
      addToast('AI test chat failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: articleForm.title,
        category: articleForm.category,
        content: articleForm.content,
        tags: articleForm.tags.split(',').map((t) => t.trim())
      };

      const res = await api.post('/ai/knowledge-base', payload);
      if (res.data.success) {
        addToast('Knowledge base entry published!', 'success');
        setIsAddModalOpen(false);
        setArticleForm({ title: '', category: 'FAQ', content: '', tags: '' });
        fetchKnowledgeBase();
      }
    } catch (err) {
      addToast('Failed to add article', 'error');
    }
  };

  const handleDeleteArticle = async (id) => {
    try {
      await api.delete(`/ai/knowledge-base/${id}`);
      addToast('Article removed', 'info');
      fetchKnowledgeBase();
    } catch (err) {
      addToast('Failed to delete article', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-amber-200/60 pb-5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-600" /> SEMANTIC KNOWLEDGE GROUNDING
          </span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">AI Assistant & Knowledge Grounding</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure conversational parameters, manage company FAQs & policies, and test database-grounded recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playground / Test Panel */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              title="Interactive AI Playground"
              subtitle="Test natural language requirement extraction and property grounding"
            />
            <CardContent className="space-y-4">
              <form onSubmit={handleTestChat} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Simulate Customer WhatsApp Message
                  </label>
                  <textarea
                    rows={3}
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="w-full p-3 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                    placeholder="Ask about properties, pricing, policies, or site visits..."
                  />
                </div>
                <Button type="submit" size="sm" variant="gold" isLoading={isTesting} icon={Sparkles}>
                  Generate Grounded AI Response
                </Button>
              </form>

              {testResponse && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <span className="font-semibold text-zinc-950 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-zinc-700" /> AI Grounded Output
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Grounded in {testResponse.groundedProperties?.length || 0} MongoDB properties
                    </span>
                  </div>

                  <p className="whitespace-pre-line leading-relaxed text-zinc-700">
                    {testResponse.replyText}
                  </p>

                  {testResponse.extractedRequirements && Object.keys(testResponse.extractedRequirements).length > 0 && (
                    <div className="p-2.5 bg-white rounded-lg text-[11px] border border-zinc-200 space-y-1">
                      <span className="font-bold text-zinc-800 block">Extracted Requirements:</span>
                      <pre className="text-[10px] text-zinc-600">
                        {JSON.stringify(testResponse.extractedRequirements, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Knowledge Base Articles */}
        <Card className="flex flex-col">
          <CardHeader
            title="Knowledge Base & Policy Grounding"
            subtitle="Verified company info, payment policies, and FAQs"
            action={
              <Button size="sm" variant="gold" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
                Add Entry
              </Button>
            }
          />
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[32rem]">
            {loadingKb ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : kbArticles.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                No knowledge base entries yet. Add FAQs or booking policies!
              </div>
            ) : (
              kbArticles.map((art) => (
                <div
                  key={art._id}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-950 transition space-y-1.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-950">{art.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {art.category}
                      </span>
                      <button
                        onClick={() => handleDeleteArticle(art._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-950 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">{art.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Add Article Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Knowledge Base Article" size="md">
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Title *</label>
            <input
              type="text"
              required
              value={articleForm.title}
              onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="e.g. Booking Advance & Refund Policy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Category</label>
            <select
              value={articleForm.category}
              onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white"
            >
              <option value="FAQ">FAQ</option>
              <option value="Policy">Policy</option>
              <option value="Booking Process">Booking Process</option>
              <option value="Pricing & Payments">Pricing & Payments</option>
              <option value="Site Visit Guidelines">Site Visit Guidelines</option>
              <option value="Legal & Documentation">Legal & Documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Content / Policy Details *</label>
            <textarea
              rows={4}
              required
              value={articleForm.content}
              onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="Explain the verified policy in detail so the AI can ground its answers accurately..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish to Knowledge Base</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
