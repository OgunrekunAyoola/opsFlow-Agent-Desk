'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FadeUp } from '@/components/ui/FadeUp';
import { X, Check } from 'lucide-react';

const OLD_WAY = [
  { title: "Manual Triage", desc: "Agents spend hours every day manually tagging and routing basic tickets." },
  { title: "Generic Templates", desc: "Impersonal macro-based replies that make customers feel like just another number." },
  { title: "Static Knowledge", desc: "Knowledge base articles go out of date immediately, leading to incorrect answers." }
];

const NEW_WAY = [
  { title: "Instant AI Triage", desc: "Every ticket is instantly prioritized and routed to the perfect agent in seconds." },
  { title: "Hyper-Personalized Drafts", desc: "AI-generated replies that sound exactly like your best agent and use latest data." },
  { title: "Dynamic RAG Ingestion", desc: "Our AI learns from every docs update and Slack thread in real-time." }
];

export function ProblemSolution() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24">
          
          {/* Left Column: The Old Way */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4 block">
              The old way
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-8">
              Legacy support is <span className="text-zinc-500">bottlenecked by humans</span>
            </h2>
            <div className="space-y-6">
              {OLD_WAY.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300">{item.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: The OpsFlow Way */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-4 block">
              The OpsFlow way
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-8">
              AI-native desk built for <span className="text-accent">high velocity</span>
            </h2>
            <div className="space-y-6">
              {NEW_WAY.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-accent/10 bg-accent/[0.02]">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 blur-[120px] pointer-events-none -z-10" />
    </section>
  );
}
