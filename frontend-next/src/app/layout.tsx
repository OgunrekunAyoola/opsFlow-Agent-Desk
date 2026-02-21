import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OpsFlow – Autonomous Support Platform',
  description: 'AI-powered ticket triage and replies for modern support teams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        <div
          className="min-h-screen flex flex-col"
          style={{
            backgroundImage: 'linear-gradient(180deg, #0A0E27 0%, #1A1F3A 100%)',
          }}
        >
          <ToastProvider>
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
                      href="/login"
                      className="text-xs lg:text-sm text-white/80 hover:text-white"
                    >
                      Log in
                    </Link>
                    <Link href="/signup">
                      <span className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-cyan-500 text-xs lg:text-sm font-medium text-white shadow-md hover:bg-cyan-400 transition-colors">
                        Start free
                      </span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="inline-flex md:hidden items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    aria-label="Toggle navigation"
                    onClick={() => {
                      const el = document.getElementById('mobile-nav');
                      if (!el) return;
                      const isHidden = el.classList.contains('hidden');
                      if (isHidden) {
                        el.classList.remove('hidden');
                      } else {
                        el.classList.add('hidden');
                      }
                    }}
                  >
                    <span className="block h-0.5 w-4 bg-white rounded-sm mb-1" />
                    <span className="block h-0.5 w-4 bg-white rounded-sm mb-1" />
                    <span className="block h-0.5 w-4 bg-white rounded-sm" />
                  </button>
                </div>
              </div>
              <div
                id="mobile-nav"
                className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl hidden"
              >
                <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col gap-2 text-sm">
                  <Link
                    href="/#why-opsflow"
                    className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
                  >
                    Features
                  </Link>
                  <Link
                    href="/#integrations"
                    className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
                  >
                    Integrations
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/docs"
                    className="px-3 py-1 rounded-full font-medium text-white/80 hover:bg-white/10"
                  >
                    Docs
                  </Link>
                  <div className="mt-2 flex flex-col gap-2">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full inline-flex items-center justify-center rounded-full bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
                    >
                      Start free
                    </Link>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/10 bg-slate-950/90">
              <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60">
                <div className="space-y-1">
                  <span className="block">
                    © {new Date().getFullYear()} OpsFlow. All rights reserved.
                  </span>
                  <span className="block text-white/50">
                    Enterprise-ready security • Multi-tenant architecture • AI-first support
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </div>
              </div>
            </footer>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
