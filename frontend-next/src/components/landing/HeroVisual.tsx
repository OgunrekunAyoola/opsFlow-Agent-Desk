'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-tokens';
import { TypewriterText } from '../ui/TypewriterText';

export function HeroVisual() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div className="absolute -inset-10 bg-accent/20 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
      
      {/* Floating Card Container */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative bg-surface/40 backdrop-blur-xl border border-white/5 rounded-large shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Panel: Mock Ticket */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-xs font-bold text-textSubtle">
              JD
            </div>
            <div>
              <div className="text-sm font-semibold text-textPrimary">Jane Doe</div>
              <div className="text-xs text-textSubtle">jane@startup.com</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-white/5 rounded w-[90%] animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-[70%] animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-[85%] animate-pulse" />
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-widest">AI Agent Processing</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-accent/20 rounded w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={mounted ? { width: '94%' } : {}}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1.5 }}
                    className="h-full bg-accent"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-accent">
                  <span>Confidence Score</span>
                  <span>94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: AI Analysis */}
        <div className="flex-1 p-6 bg-black/20">
          <div className="flex items-center justify-between mb-6">
             <span className="text-[10px] font-bold text-textSubtle uppercase tracking-widest">Drafting Reply</span>
             <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-white/10" />
               <div className="w-2 h-2 rounded-full bg-white/10" />
               <div className="w-2 h-2 rounded-full bg-white/10" />
             </div>
          </div>
          <div className="text-sm text-textPrimary leading-relaxed font-medium min-h-[160px]">
            {mounted && (
              <TypewriterText 
                text="Hello Jane, I've analyzed your request regarding the API integration failure. It appears to be a mismatch in the header authorization format. I've prepared a fix for your environment..." 
                speed={30}
                startDelay={2000}
                className="text-textPrimary"
              />
            )}
          </div>
          <div className="mt-auto pt-6 flex justify-end">
            <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-default text-[10px] font-bold text-accent uppercase tracking-widest">
              Ready to send
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
