"use client";
import React from "react";
import { motion } from "framer-motion";
import { Lock, Key } from "lucide-react";

export default function ApiAuthPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Authentication</h1>
        <p className="text-lg text-zinc-400">
          Learn how to authenticate your API requests.
        </p>
      </motion.div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Key className="text-yellow-400" /> Bearer Token
        </h2>
        <p className="text-zinc-400">
          All API requests must include your API key in the <code>Authorization</code> header.
        </p>
        <div className="bg-zinc-950 p-4 rounded border border-white/10 overflow-x-auto">
          <code className="text-sm font-mono text-zinc-300">
            Authorization: Bearer sk_live_...
          </code>
        </div>
      </section>
    </div>
  );
}
