'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAccess } from '../lib/auth-client';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      setChecking(true);
      const res = await fetchWithAccess<unknown>('/auth/me');
      if (cancelled) return;
      if (res.ok) {
        setIsLoggedIn(true);
      } else if (res.status === 401) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(null);
      }
      setChecking(false);
    }
    loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await fetchWithAccess('/auth/logout', {
      method: 'POST',
    });
    window.location.href = '/login';
  }

  const showLoggedIn = isLoggedIn === true;

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center">
            <span className="text-xs font-bold text-cyan-300">OF</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white">OpsFlow</span>
            <span className="text-[11px] text-white/60">Customer Operations Platform</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
            <Link
              href="/#why-opsflow"
              className="px-3 py-1 rounded-full font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#integrations"
              className="px-3 py-1 rounded-full font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Integrations
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-1 rounded-full font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="px-3 py-1 rounded-full font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Docs
            </Link>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs lg:text-sm text-white/80 hover:text-white hidden md:inline"
            >
              App
            </Link>
            {showLoggedIn ? (
              <>
                <Link href="/profile" className="text-xs lg:text-sm text-white/80 hover:text-white">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs lg:text-sm text-white/80 hover:text-white"
                  disabled={checking}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-xs lg:text-sm text-white/80 hover:text-white">
                  Log in
                </Link>
                <Link href="/signup">
                  <span className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-cyan-500 text-xs lg:text-sm font-medium text-white shadow-md hover:bg-cyan-400 transition-colors">
                    Start free
                  </span>
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="inline-flex md:hidden items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Toggle navigation"
            aria-expanded={open ? 'true' : 'false'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="block h-0.5 w-4 bg-white rounded-sm mb-1" />
            <span className="block h-0.5 w-4 bg-white rounded-sm mb-1" />
            <span className="block h-0.5 w-4 bg-white rounded-sm" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col gap-2 text-sm">
            <Link
              href="/dashboard"
              className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              App
            </Link>
            <Link
              href="/#why-opsflow"
              className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#integrations"
              className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Integrations
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Docs
            </Link>
            <div className="mt-2 flex flex-col gap-2">
              {showLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="w-full inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="w-full inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                    disabled={checking}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full inline-flex items-center justify-center rounded-full bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
                    onClick={() => setOpen(false)}
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
