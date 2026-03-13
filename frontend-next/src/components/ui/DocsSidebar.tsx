'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Search, ChevronRight, Menu } from 'lucide-react';

const docsNav = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Quick Start', href: '/docs/introduction' },
      { title: 'Environment Variables', href: '/docs/environment-variables' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'Agent Pipeline', href: '/docs/pipeline' },
      { title: 'PipelineContext', href: '/docs/context' },
      { title: 'How Triage Works', href: '/docs/triage' },
    ],
  },
  {
    title: 'Agents',
    items: [
      { title: 'TriageAgent', href: '/docs/agents#triage' },
      { title: 'EnrichmentAgent', href: '/docs/agents#enrichment' },
      { title: 'RAGAgent', href: '/docs/agents#rag' },
      { title: 'ActionAgent', href: '/docs/agents#action' },
      { title: 'ResponseAgent', href: '/docs/agents#response' },
      { title: 'QualityAgent', href: '/docs/agents#quality' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { title: 'Authentication', href: '/docs/api#auth' },
      { title: 'Tickets', href: '/docs/api#tickets' },
      { title: 'Webhooks', href: '/docs/api#webhooks' },
      { title: 'Analytics', href: '/docs/api#analytics' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { title: 'Email Setup', href: '/docs/integrations#email' },
      { title: 'CRM', href: '/docs/integrations#crm' },
      { title: 'Billing', href: '/docs/integrations#billing' },
    ],
  },
  {
    title: 'Deployment',
    items: [
      { title: 'Railway', href: '/docs/deployment#railway' },
      { title: 'Docker', href: '/docs/deployment#docker' },
      { title: 'Environment Variables', href: '/docs/deployment#env' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 bottom-0 left-0 z-20 hidden w-64 overflow-y-auto border-r border-white/10 bg-black py-6 px-4 lg:block">
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search documentation..."
          className="w-full rounded-md border border-white/10 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-zinc-300 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <nav className="space-y-8">
        {docsNav.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-2 text-sm font-semibold tracking-wider text-zinc-100 uppercase">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:text-accent',
                      pathname === item.href ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-zinc-400',
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
