'use client';
import React from 'react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { FadeUp } from '@/components/ui/FadeUp';

const STATS = [
  {
    value: 73,
    suffix: "%",
    label: "Reduction in first-response time",
  },
  {
    value: 4.2,
    suffix: "x",
    decimals: 1,
    label: "More tickets resolved per agent",
  },
  {
    value: 98,
    suffix: "%",
    label: "Customer satisfaction maintained",
  }
];

export function Metrics() {
  return (
    <section className="py-24 border-y border-white/5 bg-zinc-900/10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {STATS.map((stat, i) => (
            <div key={i} className="pt-8 md:pt-0 md:px-8 first:pt-0 first:px-0 text-center md:text-left">
              <FadeUp delay={i * 0.1}>
                <div className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
                  <AnimatedCounter 
                    value={stat.value} 
                    suffix={stat.suffix} 
                    decimals={stat.decimals} 
                  />
                </div>
                <p className="text-sm font-medium text-zinc-500 max-w-[200px] mx-auto md:mx-0 leading-relaxed uppercase tracking-widest text-[10px]">
                  {stat.label}
                </p>
              </FadeUp>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
