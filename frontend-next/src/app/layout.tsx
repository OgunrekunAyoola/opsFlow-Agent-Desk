import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import { SiteHeader } from '../components/SiteHeader';

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
            <SiteHeader />
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
                  <a href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                  <a href="/terms" className="hover:text-white transition-colors">
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
