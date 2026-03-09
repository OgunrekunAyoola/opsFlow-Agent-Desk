'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Book,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Search,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { fetchWithAccess } from '../../lib/auth-client';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: MessageSquare },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/kb', label: 'Knowledge Base', icon: Book },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-slate-800 bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              OF
            </div>
            <span className="text-lg font-bold text-slate-100">OpsFlow</span>
          </Link>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)] justify-between py-6 px-4">
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4">
            <div className="rounded-lg bg-slate-900 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Need help?</p>
                  <p className="text-[10px] text-slate-400">Check our docs</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7"
                onClick={() => (window.location.href = '/docs')}
              >
                Documentation
              </Button>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-1">
              <Link
                href="/profile"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/profile'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              <Button
                variant="ghost"
                onClick={async () => {
                  await fetchWithAccess('/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className="w-full justify-start gap-3 px-3 text-slate-400 hover:text-red-400 hover:bg-slate-900"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
