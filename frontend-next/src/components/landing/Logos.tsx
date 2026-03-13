'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FadeUp } from '@/components/ui/FadeUp';

const LOGOS = [
  'Vertex',
  'Prism',
  'Nexus',
  'Aura',
  'Quantix',
  'Flux'
];

export function Logos() {
  return (
    <section className="py-12 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-6">
        <FadeUp>
          <p className="text-center text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-8">
            Trusted by support teams at
          </p>
        </FadeUp>

        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between opacity-40 grayscale contrast-125">
          {LOGOS.map((logo) => (
            <FadeUp key={logo}>
              <span className="text-xl font-bold tracking-tighter text-zinc-400">
                {logo}
              </span>
            </FadeUp>
          ))}
        </div>

        {/* Mobile View - Marquee */}
        <div className="flex md:hidden overflow-hidden relative">
          <motion.div 
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <span key={i} className="text-lg font-bold tracking-tighter text-zinc-400/40">
                {logo}
              </span>
            ))}
          </motion.div>
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent z-10" />
        </div>
      </div>
    </section>
  );
}
