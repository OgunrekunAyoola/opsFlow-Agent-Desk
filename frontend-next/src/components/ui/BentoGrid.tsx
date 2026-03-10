"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrainCircuit, Globe, Zap, ShieldCheck, MessageSquare, Database } from "lucide-react";

const features = [
  {
    title: "Autonomous Triage",
    description: "AI analyzes sentiment, intent, and priority instantly, routing tickets to the right agent or workflow.",
    icon: BrainCircuit,
    className: "md:col-span-2",
  },
  {
    title: "Global Context",
    description: "Enrichment agents pull data from your CRM, Shopify, or Stripe to give full customer context.",
    icon: Globe,
    className: "md:col-span-1",
  },
  {
    title: "Instant Actions",
    description: "Don't just reply. Execute actions like refunds, cancellations, and upgrades directly.",
    icon: Zap,
    className: "md:col-span-1",
  },
  {
    title: "Enterprise Security",
    description: "Role-based access control, audit logs, and SOC2 compliant infrastructure.",
    icon: ShieldCheck,
    className: "md:col-span-2",
  },
  {
    title: "Smart Responses",
    description: "Drafts high-quality, tone-matched replies that sound human, approved in one click.",
    icon: MessageSquare,
    className: "md:col-span-1",
  },
  {
    title: "RAG Knowledge",
    description: "Retrieves answers from your documentation and past resolved tickets automatically.",
    icon: Database,
    className: "md:col-span-2",
  },
];

export function BentoGrid() {
  return (
    <section id="features" className="py-24 bg-black text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Everything you need to scale support.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            A complete suite of AI agents working in harmony to resolve tickets faster than ever before.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-900/80 transition-colors",
                feature.className
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
