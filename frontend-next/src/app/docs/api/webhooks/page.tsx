"use client";
import React from "react";
import { motion } from "framer-motion";
import { Webhook, Zap } from "lucide-react";

export default function ApiWebhooksPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Webhooks</h1>
        <p className="text-lg text-zinc-400">
          Subscribe to real-time events from OpsFlow.
        </p>
      </motion.div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" /> Events
        </h2>
        <p className="text-zinc-400">
          OpsFlow sends webhooks for the following events:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><code>ticket.created</code></li>
          <li><code>ticket.updated</code></li>
          <li><code>ticket.replied</code></li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Webhook className="text-pink-400" /> Payload Format
        </h2>
        <div className="bg-zinc-950 p-4 rounded border border-white/10 overflow-x-auto">
          <pre className="text-sm font-mono text-zinc-300">
{`{
  "event": "ticket.created",
  "data": {
    "id": "tick_123",
    "subject": "Help me",
    "status": "open"
  }
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}
