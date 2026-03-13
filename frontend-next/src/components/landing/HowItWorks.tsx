'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MagneticCard } from '@/components/ui/MagneticCard';
import { FadeUp } from '@/components/ui/FadeUp';
import { Mail, Zap, MessageSquare, Bot } from 'lucide-react';
import { tokens } from '@/lib/design-tokens';

const STEPS = [
  {
    id: '01',
    icon: Mail,
    title: "Connect Channels",
    desc: "Ingest tickets from Email, Slack, and your existing CRM in minutes.",
    visual: (
      <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-400" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="h-2 w-16 bg-white/10 rounded" />
          <div className="h-1.5 w-24 bg-white/5 rounded" />
        </div>
      </div>
    )
  },
  {
    id: '02',
    icon: Bot,
    title: "AI Triage & Draft",
    desc: "Agents light up as OpsFlow analyzes, prioritizes, and drafts responses.",
    visual: (
      <div className="mt-4 flex gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3, scale: 0.9 }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.9, 1.1, 0.9],
              backgroundColor: ['rgba(170,255,0,0.05)', 'rgba(170,255,0,0.2)', 'rgba(170,255,0,0.05)']
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.4 
            }}
            className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center"
          >
            <Zap className="w-4 h-4 text-accent" />
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: '03',
    icon: MessageSquare,
    title: "Unified Response",
    desc: "Review and send from a single high-performance interface.",
    visual: (
      <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <div className="w-2 h-2 rounded-full bg-accent/30" />
          <div className="w-2 h-2 rounded-full bg-accent/30" />
        </div>
        <span className="text-[10px] font-bold text-accent uppercase">Sent</span>
      </div>
    )
  }
];

export function HowItWorks() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-24">
          <FadeUp>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              How it works
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              OpsFlowAI sits between your customers and your support team, acting as a tireless 
              AI orchestrator that handles the heavy lifting.
            </p>
          </FadeUp>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Lines (Desktop Only) */}
          <div className="hidden md:block absolute top-[25%] left-0 w-full h-px pointer-events-none z-0">
            <div className="relative w-full h-full">
              {/* Line 1 to 2 */}
              <div className="absolute left-[20%] right-[55%] top-0 h-px border-t border-dashed border-white/10">
                <motion.div 
                  className="absolute top-[-2px] left-0 w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(170,255,0,0.5)]"
                  animate={{ left: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              {/* Line 2 to 3 */}
              <div className="absolute left-[54%] right-[20%] top-0 h-px border-t border-dashed border-white/10">
                <motion.div 
                  className="absolute top-[-2px] left-0 w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(170,255,0,0.5)]"
                  animate={{ left: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                />
              </div>
            </div>
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="z-10"
            >
              <MagneticCard className="h-full flex flex-col items-center text-center p-8 bg-zinc-900/40 backdrop-blur-sm">
                <div className="absolute -top-12 -right-4 text-8xl font-black text-white/[0.03] select-none pointer-events-none">
                  {step.id}
                </div>
                
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center mb-6 shadow-xl">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-sm text-zinc-400 mb-8 leading-relaxed">{step.desc}</p>
                
                <div className="w-full mt-auto">
                  {step.visual}
                </div>
              </MagneticCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
