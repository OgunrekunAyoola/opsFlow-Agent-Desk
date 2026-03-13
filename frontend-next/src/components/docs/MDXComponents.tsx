'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';

// Callout Component
export function Callout({ 
  children, 
  type = 'info' 
}: { 
  children: React.ReactNode, 
  type?: 'info' | 'warning' | 'success' 
}) {
  const styles = {
    info: "bg-blue-500/5 border-blue-500/20 text-blue-200",
    warning: "bg-amber-500/5 border-amber-500/20 text-amber-200",
    success: "bg-accent/5 border-accent/20 text-accent",
  };
  const Icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
  };
  const Icon = Icons[type];

  return (
    <div className={cn("my-6 p-4 rounded-xl border flex gap-4 items-start", styles[type])}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// CodeBlock Component (Shiki placeholder/wrapper)
export function CodeBlock({ 
  code, 
  language,
  html // if passed pre-rendered from shiki
}: { 
  code?: string, 
  language?: string,
  html?: string 
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group relative my-6 rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {language || 'text'}
        </span>
        <button 
          onClick={copy}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed prose-pre:m-0">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre><code>{code}</code></pre>
        )}
      </div>
    </div>
  );
}

// Steps Component
export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 ml-4 border-l border-white/10 pl-8 space-y-8 relative">
      {children}
    </div>
  );
}

export function Step({ 
  title, 
  children,
  number 
}: { 
  title: string, 
  children: React.ReactNode,
  number: number 
}) {
  return (
    <div className="relative">
      <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-accent shadow-xl">
        {number}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

// ApiTable Component
export function ApiTable({ 
  data 
}: { 
  data: Array<{ name: string, type: string, desc: string, required?: boolean }> 
}) {
  return (
    <div className="my-8 rounded-xl border border-white/10 bg-zinc-900/30 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-white/[0.02] border-b border-white/5">
          <tr>
            <th className="px-6 py-3 font-bold text-zinc-300">Parameter</th>
            <th className="px-6 py-3 font-bold text-zinc-300">Type</th>
            <th className="px-6 py-3 font-bold text-zinc-300">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row) => (
            <tr key={row.name} className="hover:bg-white/[0.01] transition-colors">
              <td className="px-6 py-4">
                <code className="text-accent bg-accent/5 px-1.5 py-0.5 rounded text-xs">
                  {row.name}{row.required && "*"}
                </code>
              </td>
              <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                {row.type}
              </td>
              <td className="px-6 py-4 text-zinc-500 leading-relaxed">
                {row.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const MDXComponents = {
  Callout,
  CodeBlock,
  Steps,
  Step,
  ApiTable,
};
