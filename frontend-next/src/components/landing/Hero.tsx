'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-tokens';
import { SplitText } from '../ui/SplitText';
import { FadeUp } from '../ui/FadeUp';
import { GlowButton } from '../ui/GlowButton';
import { GradientText } from '../ui/GradientText';
import { NoiseOverlay } from '../ui/NoiseOverlay';
import { HeroVisual } from './HeroVisual';

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-24 flex flex-col items-center justify-center overflow-hidden bg-bg">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Radial Gradient Accent */}
        <div 
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${tokens.colors.accent} 0%, transparent 70%)` }}
        />
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{ 
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <NoiseOverlay />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Top Badge */}
        <FadeUp delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-accent/30 bg-accent/5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Now in public beta · 2,000+ support teams
            </span>
          </div>
        </FadeUp>

        {/* Headline */}
        <h1 className="text-display md:text-[96px] font-bold leading-[0.95] tracking-tighter text-textPrimary mb-6">
          <SplitText text="Support that" className="block" />
          <GradientText className="block mt-2">
            <SplitText text="thinks." delay={0.4} />
          </GradientText>
        </h1>

        {/* Subheadline */}
        <FadeUp delay={0.6}>
          <p className="text-lg md:text-xl text-textMuted max-w-[520px] mx-auto leading-relaxed mb-10">
            OpsFlowAI triages every ticket, drafts intelligent replies, and learns from your best agents — automatically.
          </p>
        </FadeUp>

        {/* CTA Row */}
        <FadeUp delay={0.8} className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <GlowButton variant="filled" size="lg" href="/signup">
            Start for free →
          </GlowButton>
          <GlowButton variant="ghost" size="lg" href="#demo">
            Watch the demo
          </GlowButton>
        </FadeUp>

        {/* Social Proof */}
        <FadeUp delay={1.0} className="flex flex-col items-center gap-3">
          <div className="flex -space-x-3">
            {['AM', 'JD', 'KL', 'RW', 'ST'].map((initial, i) => (
              <div 
                key={i}
                className="w-10 h-10 rounded-full border-2 border-bg bg-surface flex items-center justify-center text-[10px] font-bold text-textMuted"
              >
                {initial}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-accent">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-lg leading-none">★</span>
              ))}
            </div>
            <span className="text-sm text-textSubtle font-medium">
              Trusted by 2,000+ support teams
            </span>
          </div>
        </FadeUp>

        {/* Hero Visual */}
        <div className="mt-20 w-full max-w-4xl">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
