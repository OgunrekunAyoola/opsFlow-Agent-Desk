import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import * as Sentry from '@sentry/nextjs';

export const metadata: Metadata = {
  title: 'OpsFlowAI – Autonomous Support Platform',
  description: 'AI-powered ticket triage, intelligent reply drafting, and support automation for modern teams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: '#040404', color: '#f0f0f0' }}>
        <Sentry.ErrorBoundary fallback={
          <div style={{ padding: 32, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something went wrong.</h1>
            <p style={{ marginTop: 8, color: '#6b7280' }}>Our team has been notified.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 20px', background: '#AAFF00', color: '#000', fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Reload</button>
          </div>
        }>
          <ToastProvider>{children}</ToastProvider>
        </Sentry.ErrorBoundary>
      </body>
    </html>
  );
}
