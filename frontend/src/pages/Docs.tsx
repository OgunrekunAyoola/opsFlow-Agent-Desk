import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Menu,
  Search,
  X,
  Bot,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Shield,
  Globe2,
  BarChart3,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import {
  type Doc,
  type DocsCategory,
  type DocsCategoryId,
  getDocByCategoryAndSlug,
  getDocsCategories,
  getDocsForCategory,
  useDocsSearch,
} from '../lib/docs';
import { Button } from '../components/ui/Button';

type Heading = {
  id: string;
  text: string;
  level: number;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(markdown: string): Heading[] {
  return markdown
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) {
        return {
          id: slugifyHeading(line.replace(/^##\s+/, '')),
          text: line.replace(/^##\s+/, ''),
          level: 2,
        };
      }
      if (line.startsWith('### ')) {
        return {
          id: slugifyHeading(line.replace(/^###\s+/, '')),
          text: line.replace(/^###\s+/, ''),
          level: 3,
        };
      }
      return null;
    })
    .filter((h): h is Heading => Boolean(h));
}

function CodeBlock(props: { inline?: boolean; className?: string; children?: ReactNode }) {
  const { inline, className, children, ...rest } = props;
  const match = /language-(\w+)/.exec(className || '');
  const language = match?.[1];
  const code = String(children ?? '');

  if (!inline && language && (Prism as any).languages[language]) {
    const html = (Prism as any).highlight(code, (Prism as any).languages[language], language);
    return (
      <pre className={`language-${language}`}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    );
  }

  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
}

const markdownComponents = {
  h1: (props: any) => {
    const text = String(props.children ?? '');
    const id = slugifyHeading(text);
    return (
      <h1
        id={id}
        {...props}
        className="scroll-mt-24 text-3xl md:text-[32px] leading-tight font-heading font-bold text-slate-900 mb-4"
      >
        {props.children}
      </h1>
    );
  },
  h2: (props: any) => {
    const text = String(props.children ?? '');
    const id = slugifyHeading(text);
    return (
      <h2
        id={id}
        {...props}
        className="scroll-mt-24 text-xl md:text-2xl leading-snug font-heading font-semibold text-slate-900 mt-8 mb-3"
      >
        {props.children}
      </h2>
    );
  },
  h3: (props: any) => {
    const text = String(props.children ?? '');
    const id = slugifyHeading(text);
    return (
      <h3
        id={id}
        {...props}
        className="scroll-mt-24 text-base md:text-lg font-heading font-semibold text-slate-800 mt-5 mb-2"
      >
        {props.children}
      </h3>
    );
  },
  p: (props: any) => (
    <p {...props} className="text-sm md:text-[15px] leading-relaxed text-slate-700 mb-3">
      {props.children}
    </p>
  ),
  ul: (props: any) => (
    <ul
      {...props}
      className="list-disc list-inside text-sm md:text-[15px] leading-relaxed text-slate-700 mb-3 space-y-1"
    >
      {props.children}
    </ul>
  ),
  ol: (props: any) => (
    <ol
      {...props}
      className="list-decimal list-inside text-sm md:text-[15px] leading-relaxed text-slate-700 mb-3 space-y-1"
    >
      {props.children}
    </ol>
  ),
  li: (props: any) => (
    <li {...props} className="pl-1">
      {props.children}
    </li>
  ),
  strong: (props: any) => (
    <strong {...props} className="font-semibold text-slate-900">
      {props.children}
    </strong>
  ),
  em: (props: any) => (
    <em {...props} className="italic text-slate-800">
      {props.children}
    </em>
  ),
  a: (props: any) => (
    <a
      {...props}
      className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noreferrer' : undefined}
    >
      {props.children}
    </a>
  ),
  blockquote: (props: any) => (
    <blockquote
      {...props}
      className="border-l-2 border-slate-200 pl-4 italic text-slate-700 bg-slate-50 rounded-r-lg py-2 pr-3 mb-4"
    >
      {props.children}
    </blockquote>
  ),
  code: CodeBlock,
};

function getCategoryById(id: DocsCategoryId): DocsCategory | undefined {
  return getDocsCategories().find((c) => c.id === id);
}

function DocsBreadcrumbs(props: { doc: Doc | null }) {
  const category = props.doc ? getCategoryById(props.doc.categoryId) : null;

  return (
    <nav className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
      <Link to="/docs" className="hover:text-slate-100">
        Docs
      </Link>
      <span>/</span>
      {category ? (
        <>
          <Link
            to={`/docs/${category.slug}/${getDocsForCategory(category.id)[0]?.slug || ''}`}
            className="hover:text-slate-100"
          >
            {category.label}
          </Link>
          {props.doc && <span>/</span>}
        </>
      ) : null}
      {props.doc && <span className="text-slate-300 truncate max-w-[50vw]">{props.doc.title}</span>}
    </nav>
  );
}

function DocsSidebar(props: { currentDoc: Doc | null }) {
  const categories = getDocsCategories();
  const currentId = props.currentDoc?.id;

  return (
    <aside className="lg:pt-4 lg:sticky lg:top-24">
      <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-3">
        <BookOpen size={14} />
        <span>Docs</span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Browse by section or jump straight into troubleshooting.
      </p>
      <nav className="space-y-5 text-sm">
        {categories.map((category) => {
          const items = getDocsForCategory(category.id);
          if (!items.length) return null;
          return (
            <div key={category.id} className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.16em]">
                {category.label}
              </div>
              <div className="space-y-1">
                {items.map((doc) => {
                  const active = doc.id === currentId;
                  return (
                    <Link
                      key={doc.id}
                      to={`/docs/${category.slug}/${doc.slug}`}
                      className={[
                        'block rounded-md px-3 py-1.5 text-xs transition-colors',
                        active
                          ? 'bg-slate-900 text-slate-100 border border-slate-700'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{doc.title}</span>
                        {doc.readTime && (
                          <span className="text-[10px] text-slate-500">{doc.readTime}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

const POPULAR_DOC_IDS = [
  'getting-started/what-is-opsflow',
  'getting-started/quick-start',
  'setup/email-forwarding',
  'troubleshooting/faq',
];

function DocsHome(props: { search: string; onSearchChange: (value: string) => void }) {
  const docs = useDocsSearch(props.search);
  const categories = getDocsCategories();

  const popular = docs.filter((doc) => POPULAR_DOC_IDS.includes(doc.id)).slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
            OpsFlow Documentation
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Everything you need to get OpsFlow running in production – from first login to inbound
            email, AI triage, and advanced integrations.
          </p>
        </div>
        <div className="max-w-xl">
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input
              type="search"
              placeholder="Search documentation..."
              className="flex-1 bg-transparent outline-none placeholder:text-slate-400 text-sm"
              value={props.search}
              onChange={(event) => props.onSearchChange(event.target.value)}
            />
          </label>
          <p className="mt-1 text-[11px] text-slate-400">
            Search matches article titles, summaries, and body text.
          </p>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-sm font-heading font-semibold text-slate-900">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/docs/getting-started/what-is-opsflow"
            className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition-shadow"
          >
            <div className="text-xs font-semibold text-indigo-500 mb-1">🤖 What is OpsFlow?</div>
            <div className="text-xs text-slate-500">
              Understand the platform, where it fits, and what it replaces.
            </div>
          </Link>
          <Link
            to="/docs/getting-started/quick-start"
            className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition-shadow"
          >
            <div className="text-xs font-semibold text-sky-500 mb-1">🚀 Quick start</div>
            <div className="text-xs text-slate-500">
              Create a workspace and wire your first tickets.
            </div>
          </Link>
          <Link
            to="/docs/setup/email-forwarding"
            className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition-shadow"
          >
            <div className="text-xs font-semibold text-emerald-500 mb-1">📧 Email setup</div>
            <div className="text-xs text-slate-500">Connect your support inbox to OpsFlow.</div>
          </Link>
          <Link
            to="/docs/troubleshooting/faq"
            className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition-shadow"
          >
            <div className="text-xs font-semibold text-amber-500 mb-1">❓ FAQ</div>
            <div className="text-xs text-slate-500">Find answers to common questions.</div>
          </Link>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-sm font-heading font-semibold text-slate-900">Browse by category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((category) => {
            const count = docs.filter((doc) => doc.categoryId === category.id).length;
            if (!count) return null;
            return (
              <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-700 mb-1">{category.label}</div>
                <p className="text-xs text-slate-500 mb-3">
                  {category.id === 'getting-started' &&
                    'Learn what OpsFlow is and how to get value in minutes.'}
                  {category.id === 'setup' &&
                    'Connect email, providers, and integrations in a safe, reversible way.'}
                  {category.id === 'features' &&
                    'Explore AI triage, auto-reply, sentiment analysis, and dashboards.'}
                  {category.id === 'integrations' &&
                    'Use OpsFlow alongside Zendesk, Intercom, and your existing stack.'}
                  {category.id === 'use-cases' &&
                    'See how e-commerce, SaaS, and agencies put OpsFlow to work.'}
                  {category.id === 'troubleshooting' &&
                    'Fix the most common issues with inbound email, AI, and access.'}
                </p>
                <div className="text-[11px] text-slate-400">{count} docs</div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-sm font-heading font-semibold text-slate-900">Popular articles</h2>
        <div className="space-y-3">
          {popular.map((doc, index) => {
            const category = getCategoryById(doc.categoryId);
            return (
              <Link
                key={doc.id}
                to={`/docs/${category?.slug}/${doc.slug}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-4 text-right">{index + 1}.</span>
                  <div>
                    <div className="text-xs font-medium text-slate-800">{doc.title}</div>
                    {doc.summary && (
                      <div className="text-[11px] text-slate-500 line-clamp-1">{doc.summary}</div>
                    )}
                  </div>
                </div>
                {doc.readTime && (
                  <div className="text-[11px] text-slate-400 hidden sm:block">{doc.readTime}</div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function HelpfulFooter() {
  return (
    <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="text-xs text-slate-500">Was this helpful?</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1.5 text-xs rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          👍 Yes
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          👎 No
        </button>
      </div>
    </div>
  );
}

function DocsArticlePage(props: { doc: Doc }) {
  const category = getCategoryById(props.doc.categoryId);
  const inCategory = getDocsForCategory(props.doc.categoryId);
  const currentIndex = inCategory.findIndex((d) => d.id === props.doc.id);
  const nextDoc =
    currentIndex >= 0 && currentIndex < inCategory.length - 1 ? inCategory[currentIndex + 1] : null;
  const headings = extractHeadings(props.doc.content);

  return (
    <div className="space-y-6">
      <DocsBreadcrumbs doc={props.doc} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-1">
            {props.doc.title}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            {category && <span>{category.label}</span>}
            {props.doc.readTime && (
              <>
                <span>•</span>
                <span>{props.doc.readTime}</span>
              </>
            )}
            {props.doc.updatedAt && (
              <>
                <span>•</span>
                <span>Updated {props.doc.updatedAt}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6">
        <div className="lg:flex lg:items-start lg:gap-10">
          <div className="lg:flex-1 min-w-0">
            <div className="prose prose-sm max-w-none prose-slate">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents as any}>
                {props.doc.content}
              </ReactMarkdown>
            </div>
            <HelpfulFooter />
            {nextDoc && (
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Next</div>
                <Link
                  to={`/docs/${category?.slug}/${nextDoc.slug}`}
                  className="ml-auto text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {nextDoc.title} →
                </Link>
              </div>
            )}
          </div>
          {headings.length > 0 && (
            <aside className="hidden lg:block w-56 text-xs text-slate-500">
              <div className="sticky top-24 space-y-2">
                <div className="font-semibold text-slate-600 text-[11px] uppercase tracking-[0.14em]">
                  On this page
                </div>
                <ul className="space-y-1">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? 'pl-3' : ''}>
                      <a href={`#${heading.id}`} className="hover:text-slate-700">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export function Docs() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const path = location.pathname.replace(/^\/docs\/?/, '');
  const parts = path.split('/').filter(Boolean);
  const categorySlug = parts[0];
  const slug = parts[1];
  const currentDoc = categorySlug && slug ? getDocByCategoryAndSlug(categorySlug, slug) : null;
  const isHome = !categorySlug;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <span className="text-xs font-bold">OF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                OpsFlow
              </span>
              <span className="text-[11px] text-slate-500">Documentation</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-md">
            <div className="flex items-center gap-2 w-full px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50">
              <Search size={14} className="text-slate-400" />
              <input
                type="search"
                placeholder="Search documentation..."
                className="flex-1 bg-transparent outline-none placeholder:text-slate-400 text-xs"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-medium"
              >
                Start free
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-2 text-sm">
              <Link
                to="/docs"
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Docs home
              </Link>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Start free
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.09),_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[260px,minmax(0,1fr)] gap-10 lg:gap-16">
            <DocsSidebar currentDoc={currentDoc} />
            <div className="min-w-0">
              {isHome && <DocsHome search={searchQuery} onSearchChange={setSearchQuery} />}
              {!isHome && currentDoc && <DocsArticlePage doc={currentDoc} />}
              {!isHome && !currentDoc && (
                <div className="space-y-4">
                  <DocsBreadcrumbs doc={null} />
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-sm text-amber-800">
                    <div className="font-heading font-semibold mb-1">Article not found</div>
                    <p className="text-xs">
                      This URL does not match any documentation article yet. Go back to the docs
                      homepage to browse available guides.
                    </p>
                    <div className="mt-4">
                      <Link
                        to="/docs"
                        className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        ← Back to docs
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-white/10 bg-white/5">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-grad-main flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Bot size={24} />
                </div>
                <span className="font-heading font-bold text-xl tracking-tight">OpsFlow</span>
              </div>
              <p className="mt-4 text-white/70 text-sm">
                Autonomous support platform for modern teams.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <a href="#" aria-label="Twitter" className="text-white/70 hover:text-white">
                  <Twitter />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-white">
                  <Linkedin />
                </a>
                <a href="#" aria-label="GitHub" className="text-white/70 hover:text-white">
                  <Github />
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#features-future" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#integrations" className="hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/docs" className="hover:text-white">
                    Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-4">Stay in the loop</h5>
              <form className="flex items-center gap-2">
                <div className="flex-1 h-10 rounded-lg bg-white/10 border border-white/20 px-3 text-sm text-white/80 flex items-center gap-2">
                  <Mail size={16} className="opacity-70" />
                  <input
                    aria-label="Email"
                    type="email"
                    placeholder="you@company.com"
                    className="bg-transparent outline-none flex-1 placeholder:text-white/50"
                  />
                </div>
                <Button size="sm" className="bg-grad-main text-white">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-white/50 mt-2">
                By subscribing you agree to our Terms & Privacy.
              </p>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-green-400" />
              <span>Enterprise security: SSO, SAML, SOC 2-ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 size={14} className="text-cyan-400" />
              <span>Global: 99.9% uptime, multi-region</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-purple-400" />
              <span>Analytics: actionable insights out of the box</span>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-white/70 text-sm">
            © 2026 OpsFlow Agent Desk · Terms · Privacy · Security
          </div>
        </div>
      </footer>
    </div>
  );
}
