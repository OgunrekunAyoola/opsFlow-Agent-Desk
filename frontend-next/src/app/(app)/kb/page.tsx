'use client';

import { useEffect, useState } from 'react';
import { fetchWithAccess } from '../../../lib/auth-client';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge } from '../../../components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/Card';
import {
  Book,
  Sparkles,
  Check,
  X,
  Loader2,
  FileText,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

type KBArticle = {
  _id: string;
  title: string;
  body: string;
  tags?: string[];
  updatedAt: string;
};

type KBArticleProposal = {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  confidenceScore: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

type ListResponse<T> = {
  items: T[];
};

type ArticleResponse = {
  article: KBArticle;
};

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'articles' | 'proposals'>('articles');

  // Articles State
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [search, setSearch] = useState('');
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Proposals State
  const [proposals, setProposals] = useState<KBArticleProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  // Editor State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [processingProposal, setProcessingProposal] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function loadArticles(query?: string) {
    setLoadingArticles(true);
    setError(null);
    const params = new URLSearchParams();
    if (query && query.trim()) {
      params.set('q', query.trim());
    }
    const path = params.toString() ? `/kb?${params.toString()}` : '/kb';
    const res = await fetchWithAccess<ListResponse<KBArticle>>(path);
    if (!res.ok) {
      // If 404/401 just clear
      setArticles([]);
    } else if (res.data) {
      setArticles(res.data.items || []);
    }
    setLoadingArticles(false);
  }

  async function loadProposals() {
    setLoadingProposals(true);
    const res = await fetchWithAccess<ListResponse<KBArticleProposal>>('/kb/proposals');
    if (res.ok && res.data) {
      setProposals(res.data.items || []);
    }
    setLoadingProposals(false);
  }

  useEffect(() => {
    loadArticles();
    loadProposals();
  }, []);

  function startNew() {
    setActiveId(null);
    setTitle('');
    setBody('');
    setActiveTab('articles');
  }

  function selectArticle(article: KBArticle) {
    setActiveId(article._id);
    setTitle(article.title);
    setBody(article.body);
  }

  async function handleSave() {
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (activeId) {
        const res = await fetchWithAccess<ArticleResponse>(`/kb/${activeId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, body }),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetchWithAccess<ArticleResponse>('/kb', {
          method: 'POST',
          body: JSON.stringify({ title, body }),
        });
        if (!res.ok || !res.data) throw new Error();
        setActiveId(res.data.article._id);
      }
      await loadArticles(search);
    } catch {
      setError('Failed to save article.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!activeId) return;
    setDeleting(true);
    try {
      const res = await fetchWithAccess(`/kb/${activeId}`, { method: 'DELETE' });
      if (res.ok) {
        startNew();
        await loadArticles(search);
      } else {
        setError('Failed to delete article.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleApproveProposal(proposal: KBArticleProposal) {
    setProcessingProposal(proposal._id);
    try {
      const res = await fetchWithAccess(`/kb/proposals/${proposal._id}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          title: proposal.title,
          body: proposal.content,
          tags: proposal.tags,
        }),
      });

      if (res.ok) {
        // Remove from proposals list
        setProposals((prev) => prev.filter((p) => p._id !== proposal._id));
        // Refresh articles
        loadArticles(search);
        // Switch to articles tab and select the new article (optional, but good UX)
        setActiveTab('articles');
        // We could try to find and select it, but for now just switching tab is enough
      } else {
        setError('Failed to approve proposal.');
      }
    } catch {
      setError('Error approving proposal.');
    } finally {
      setProcessingProposal(null);
    }
  }

  async function handleRejectProposal(id: string) {
    setProcessingProposal(id);
    try {
      const res = await fetchWithAccess(`/kb/proposals/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        setProposals((prev) => prev.filter((p) => p._id !== id));
      }
    } catch {
      setError('Error rejecting proposal.');
    } finally {
      setProcessingProposal(null);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Knowledge Base</h1>
          <p className="text-slate-400">Manage articles and review AI proposals.</p>
        </div>
        <Button onClick={startNew}>
          <Plus className="mr-2 h-4 w-4" /> New Article
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'articles'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Book className="h-4 w-4" />
          Articles
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'proposals'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Proposals
          {proposals.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 px-1.5 h-5 text-[10px] bg-purple-500/20 text-purple-300"
            >
              {proposals.length}
            </Badge>
          )}
        </button>
      </div>

      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  loadArticles(e.target.value);
                }}
                className="pl-9 bg-slate-950/50 border-slate-800"
              />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/30 divide-y divide-slate-800 overflow-hidden">
              {loadingArticles ? (
                <div className="p-8 text-center text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : articles.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No articles found.</div>
              ) : (
                articles.map((article) => (
                  <button
                    key={article._id}
                    onClick={() => selectArticle(article)}
                    className={`w-full text-left p-4 text-sm hover:bg-slate-900/50 transition-colors ${
                      activeId === article._id ? 'bg-slate-900 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-slate-200 truncate">{article.title}</div>
                    <div className="mt-1 text-slate-500 line-clamp-2 text-xs">{article.body}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card className="border-slate-800 bg-slate-950/30 h-full">
              <CardHeader className="border-b border-slate-800/50 pb-4">
                <CardTitle className="text-base font-medium text-slate-200">
                  {activeId ? 'Edit Article' : 'New Article'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Article title"
                    className="bg-slate-950/50 border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Content (Markdown)</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write article content..."
                    className="min-h-[300px] font-mono text-sm bg-slate-950/50 border-slate-800"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {activeId ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="ml-2">Delete</span>
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="ml-2">Save Article</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'proposals' && (
        <div className="space-y-6">
          {loadingProposals ? (
            <div className="py-20 text-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Looking for new insights...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
              <Sparkles className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No pending proposals</h3>
              <p className="text-slate-500 mt-2 max-w-md text-center">
                The AI automatically suggests new articles based on resolved tickets. Check back
                later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {proposals.map((proposal) => (
                <Card
                  key={proposal._id}
                  className="border-purple-500/20 bg-purple-900/5 overflow-hidden"
                >
                  <CardHeader className="bg-purple-900/10 border-b border-purple-500/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                          >
                            Confidence: {proposal.confidenceScore}%
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-lg text-slate-200 leading-snug">
                          {proposal.title}
                        </CardTitle>
                      </div>
                      <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-1" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="prose prose-invert prose-sm max-w-none text-slate-400 bg-slate-950/50 p-4 rounded-md border border-slate-800/50 max-h-[200px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">{proposal.content}</pre>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                        onClick={() => handleApproveProposal(proposal)}
                        disabled={!!processingProposal}
                      >
                        {processingProposal === proposal._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Approve & Publish
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                        onClick={() => handleRejectProposal(proposal._id)}
                        disabled={!!processingProposal}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
