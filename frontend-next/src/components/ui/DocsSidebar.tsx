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
      { title: 'Introduction', href: '/docs' },
      { title: 'Quickstart', href: '/docs/getting-started' },
      { title: 'Installation', href: '/docs/installation' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'AI Copilot', href: '/docs/ai-copilot' },
      { title: 'Workflows', href: '/docs/workflows' },
      { title: 'Knowledge Base', href: '/docs/knowledge-base' },
      { title: 'Email Ingestion', href: '/docs/email-api-ingestion' },
      { title: 'Integrations', href: '/docs/integrations' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { title: 'Authentication', href: '/docs/api/auth' },
      { title: 'Tickets', href: '/docs/api/tickets' },
      { title: 'Webhooks', href: '/docs/api/webhooks' },
    ],
  },
  {
    title: 'Settings',
    items: [{ title: 'General', href: '/docs/settings' }],
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
                      'block rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:text-blue-400',
                      pathname === item.href ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400',
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
