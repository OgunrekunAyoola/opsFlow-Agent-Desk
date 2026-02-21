'use client';

import { useEffect, useState } from 'react';
import { fetchWithAccess } from '../../lib/auth-client';

type KBArticle = {
  _id: string;
  title: string;
  body: string;
  tags?: string[];
  updatedAt: string;
};

type ListResponse = {
  items: KBArticle[];
};

type ArticleResponse = {
  article: KBArticle;
};

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadArticles(query?: string) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (query && query.trim()) {
      params.set('q', query.trim());
    }
    const path = params.toString() ? `/kb?${params.toString()}` : '/kb';
    const res = await fetchWithAccess<ListResponse>(path);
    if (!res.ok) {
      setError('Unable to load articles.');
      setArticles([]);
    } else if (res.data) {
      setArticles(res.data.items || []);
    } else {
      setArticles([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadArticles();
  }, []);

  function startNew() {
    setActiveId(null);
    setTitle('');
    setBody('');
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
        if (!res.ok) {
          setError('Unable to save article changes.');
        }
      } else {
        const res = await fetchWithAccess<ArticleResponse>('/kb', {
          method: 'POST',
          body: JSON.stringify({ title, body }),
        });
        if (!res.ok || !res.data || !res.data.article) {
          setError('Unable to create article.');
        } else {
          setActiveId(res.data.article._id);
        }
      }
      await loadArticles(search);
    } catch {
      setError('Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!activeId) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetchWithAccess<{ ok: boolean }>(`/kb/${activeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setError('Unable to delete article.');
      } else {
        startNew();
        await loadArticles(search);
      }
    } catch {
      setError('Something went wrong while deleting.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Base</h1>
          <p className="text-sm text-white/70">
            Store product answers your AI copilot can use when drafting replies.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="search"
            placeholder="Search articles"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              loadArticles(value);
            }}
            className="w-56 rounded-full border border-white/15 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={startNew}
            className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
          >
            New article
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="text-xs font-medium text-white/60 flex items-center justify-between">
            <span>Articles</span>
            {loading && <span className="text-white/40">Loading…</span>}
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/70 divide-y divide-white/5 max-h-[520px] overflow-y-auto">
            {articles.length === 0 && !loading ? (
              <div className="p-4 text-xs text-white/60">
                No articles yet. Create your first article on the right.
              </div>
            ) : (
              articles.map((article) => (
                <button
                  key={article._id}
                  type="button"
                  onClick={() => selectArticle(article)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 ${
                    activeId === article._id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="font-medium truncate">{article.title}</div>
                  <div className="mt-1 text-[11px] text-white/60 line-clamp-2">
                    {article.body}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <div className="text-xs font-medium text-white/60">
            {activeId ? 'Edit article' : 'New article'}
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs text-white/70">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="How to reset your password"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-white/70">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[260px] rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Write the answer your support team would send to a customer…"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-white/50">
                Only admins can create and edit articles. Regular agents can still read them and the
                AI uses them to draft replies.
              </div>
              <div className="flex items-center gap-2">
                {activeId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-full border border-red-400/40 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-full bg-cyan-500 text-xs font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

