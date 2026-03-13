'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MagneticCard } from '@/components/ui/MagneticCard';
import { FadeUp } from '@/components/ui/FadeUp';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Head of CX",
    company: "LuxeDirect",
    initials: "SC",
    quote: "OpsFlowAI cut our first response time by 80%. Our agents actually enjoy work now — they're not buried in repetitive tickets."
  },
  {
    name: "Marcus Rodriguez",
    role: "Support Manager",
    company: "SaaSify",
    initials: "MR",
    quote: "The AI draft quality is insane. 9 out of 10 suggestions go out unchanged. We've handled 3x the volume with the same team size."
  },
  {
    name: "Priya Sharma",
    role: "VP Customer Success",
    company: "FinTech Hub",
    initials: "PS",
    quote: "We evaluated 8 tools. OpsFlowAI was the only one that felt like a true AI partner, not just autocomplete for tickets."
  }
];

export function Testimonials() {
  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-20">
          <FadeUp>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Loved by <span className="text-accent underline decoration-accent/20 underline-offset-8">support leaders</span>
            </h2>
          </FadeUp>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <MagneticCard className="h-full flex flex-col p-8 bg-zinc-900/40 border-white/5">
                <Quote className="w-12 h-12 text-accent/5 absolute top-6 right-6" />
                
                <p className="text-lg text-zinc-300 mb-10 italic leading-relaxed z-10">
                  "{t.quote}"
                </p>
                
                <div className="mt-auto flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                      {t.role} @ {t.company}
                    </p>
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
