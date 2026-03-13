'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MagneticCard } from '@/components/ui/MagneticCard';
import { FadeUp } from '@/components/ui/FadeUp';
import { 
  ShieldCheck, 
  Zap, 
  Search, 
  Layers, 
  BarChart3, 
  Users 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: "AI Triage",
    desc: "Every ticket is instantly priority-scored, categorized, and routed to the right agent."
  },
  {
    icon: Search,
    title: "Smart Drafts",
    desc: "Context-aware replies drafted from your knowledge base. Agents review and send."
  },
  {
    icon: Layers,
    title: "RAG Knowledge Base",
    desc: "Automatically syncs with your docs, Slack, and previous ticket resolutions."
  },
  {
    icon: ShieldCheck,
    title: "Multi-Channel Ingestion",
    desc: "Connect email, chat, social, and API endpoints into one unified queue."
  },
  {
    icon: BarChart3,
    title: "Team Analytics",
    desc: "Real-time CSAT, resolution times, and agent performance dashboards."
  },
  {
    icon: Users,
    title: "Human-in-the-Loop",
    desc: "Combine AI efficiency with the nuance only your best agents can provide."
  }
];

export function FeaturesGrid() {
  return (
    <section className="py-32 bg-zinc-900/20">
      <div className="container mx-auto px-6">
        
        <div className="mb-20">
          <FadeUp>
            <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-4 block">
              Platform Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Everything you need to <br /><span className="text-accent underline decoration-accent/20 underline-offset-8">scale with AI</span>
            </h2>
          </FadeUp>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <MagneticCard className="h-full group hover:bg-zinc-800/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
              </MagneticCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
