'use client';
import React from 'react';
import { GlowButton } from '@/components/ui/GlowButton';
import { FadeUp } from '@/components/ui/FadeUp';

export function FinalCTA() {
  return (
    <section className="py-48 relative overflow-hidden bg-black">
      <div className="container mx-auto px-6 text-center relative z-10">
        <FadeUp>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8">
            Ready to automate <br /><span className="text-accent underline decoration-accent/20 underline-offset-8">your support?</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-12 text-lg">
            Join 2,000+ teams resolving tickets faster, happier, and at a fraction of the cost.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlowButton variant="filled" className="px-10 h-14 text-lg">
              Start for free →
            </GlowButton>
            <p className="text-xs text-zinc-500 max-w-[150px] sm:max-w-none">
              No credit card · 14-day trial · Cancel anytime
            </p>
          </div>
        </FadeUp>
      </div>

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[160px] pointer-events-none" />
    </section>
  );
}
