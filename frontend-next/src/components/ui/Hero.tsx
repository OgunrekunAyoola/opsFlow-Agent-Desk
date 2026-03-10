"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white pt-20">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-zinc-300">
            OpsFlow Agent Desk v2.0 is live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50"
        >
          Customer Support, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
            Reimagined by AI Agents.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Stop drowning in tickets. Let our autonomous agents handle triage, responses, and actions while your team focuses on high-value conversations.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-zinc-200 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <span className="mr-2">Start for free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Read Documentation
          </Link>
        </motion.div>

        {/* Dashboard Preview (Mockup) */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-20 relative rounded-xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-violet-500/10" />
          <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-black/40">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="ml-4 h-6 w-64 rounded-full bg-white/5" />
          </div>
          <div className="relative aspect-video bg-zinc-950/50 p-8 grid grid-cols-3 gap-6">
            {/* Sidebar Mock */}
            <div className="col-span-1 space-y-4">
              <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse delay-75" />
              <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse delay-100" />
              <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse delay-150" />
            </div>
            {/* Content Mock */}
            <div className="col-span-2 space-y-4">
              <div className="flex gap-4 mb-8">
                <div className="h-24 w-full bg-white/5 rounded-xl border border-white/5 animate-pulse" />
                <div className="h-24 w-full bg-white/5 rounded-xl border border-white/5 animate-pulse delay-100" />
              </div>
              <div className="h-64 w-full bg-white/5 rounded-xl border border-white/5 animate-pulse delay-200" />
            </div>
          </div>
          
          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-10 bg-zinc-900/90 border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-md max-w-xs"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Ticket Resolved</div>
                <div className="text-xs text-zinc-400">Just now • AI Agent</div>
              </div>
            </div>
            <div className="text-xs text-zinc-300">
              Refund processed successfully via Stripe integration.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
