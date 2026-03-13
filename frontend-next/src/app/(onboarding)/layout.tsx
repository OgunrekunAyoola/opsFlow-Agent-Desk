'use client';

import { ReactNode } from 'react';
import { OnboardingProvider } from '../../context/OnboardingContext';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0ea5e920,transparent_50%)] pointer-events-none" />
        <div className="w-full max-w-3xl z-10">{children}</div>
      </div>
    </OnboardingProvider>
  );
}
