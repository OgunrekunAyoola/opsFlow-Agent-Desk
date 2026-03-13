'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowButton } from '@/components/ui/GlowButton';
import { FadeUp } from '@/components/ui/FadeUp';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: "Starter",
    price: { monthly: 49, annual: 39 },
    desc: "Perfect for small teams getting started with AI support.",
    features: ["Up to 3 agents", "500 AI replies/mo", "Email channel", "Basic analytics", "48h support"]
  },
  {
    name: "Growth",
    price: { monthly: 149, annual: 119 },
    desc: "For growing teams that need more power and integrations.",
    features: ["Up to 20 agents", "10,000 AI replies/mo", "All channels", "Advanced analytics", "Priority support", "Custom workflows"],
    recommended: true
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", annual: "Custom" },
    desc: "For large organizations with advanced security needs.",
    features: ["Unlimited agents", "Unlimited replies", "All channels + API", "SSO & SAML", "Dedicated CSM", "SLA guarantee"]
  }
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-16">
          <FadeUp>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Simple, <span className="text-accent underline decoration-accent/20 underline-offset-8">transparent</span> pricing
            </h2>
            
            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-zinc-500'} transition-colors`}>Monthly</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6 rounded-full bg-zinc-800 border border-white/10 p-1 relative"
              >
                <motion.div 
                  className="w-4 h-4 rounded-full bg-accent shadow-[0_0_8px_rgba(170,255,0,0.4)]"
                  animate={{ x: isAnnual ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isAnnual ? 'text-white' : 'text-zinc-500'} transition-colors`}>Annual</span>
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  SAVE 20%
                </span>
              </div>
            </div>
          </FadeUp>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-end">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border ${
                plan.recommended 
                  ? 'border-accent/40 bg-accent/[0.03] scale-105 z-10 shadow-[0_40px_80px_rgba(0,0,0,0.4)]' 
                  : 'border-white/5 bg-zinc-900/40'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full shadow-[0_0_20px_rgba(170,255,0,0.4)]">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {typeof plan.price === 'string' ? plan.price : (
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isAnnual ? 'annual' : 'monthly'}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          ${isAnnual ? plan.price.annual : plan.price.monthly}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </span>
                  {typeof plan.price !== 'string' && (
                    <span className="text-zinc-500 text-sm font-medium">/mo</span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
                  {plan.desc}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <GlowButton 
                variant={plan.recommended ? "filled" : "ghost"} 
                className="w-full"
              >
                {plan.name === 'Enterprise' ? 'Contact Sales →' : 'Start free trial →'}
              </GlowButton>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
