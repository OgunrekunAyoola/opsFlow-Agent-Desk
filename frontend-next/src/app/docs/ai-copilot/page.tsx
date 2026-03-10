'use client';
import React from 'react';
import { Bot, BrainCircuit, MessageSquare, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiCopilotDocsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">AI Copilot</h1>
        <p className="text-lg text-zinc-400">
          Understand how OpsFlow's autonomous agents triage tickets, draft replies, and execute
          actions.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <BrainCircuit className="text-blue-400" /> AI Triage
        </h2>
        <p className="text-zinc-400">
          When a new ticket arrives, the Triage Agent analyzes the content to determine:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li>
            <strong>Intent:</strong> What does the customer want? (e.g., Refund, Support, Feature
            Request)
          </li>
          <li>
            <strong>Sentiment:</strong> Is the customer angry, happy, or neutral?
          </li>
          <li>
            <strong>Priority:</strong> How urgent is this request?
          </li>
          <li>
            <strong>Category:</strong> Which department should handle this?
          </li>
        </ul>
        <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-sm text-zinc-300">
          The Triage Agent runs automatically on every new ticket. You can view the analysis in the
          "AI Insights" panel on the ticket detail page.
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <MessageSquare className="text-violet-400" /> Draft Replies & Confidence
        </h2>
        <p className="text-zinc-400">
          The Response Agent drafts a reply based on your Knowledge Base and previous resolved
          tickets. Each draft comes with a <strong>Confidence Score</strong> (0-100%).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="font-semibold text-green-400 mb-1">High (&gt;90%)</div>
            <div className="text-sm text-zinc-400">Safe for auto-reply if enabled.</div>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="font-semibold text-yellow-400 mb-1">Medium (50-90%)</div>
            <div className="text-sm text-zinc-400">Requires human review.</div>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="font-semibold text-red-400 mb-1">Low (&lt;50%)</div>
            <div className="text-sm text-zinc-400">Agent will ask for clarification.</div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Bot className="text-emerald-400" /> Auto-Replies
        </h2>
        <p className="text-zinc-400">
          You can configure OpsFlow to automatically send replies when the confidence score meets a
          certain threshold (e.g., 95%) and the category is deemed "Safe" (e.g., "General Inquiry").
        </p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Safety First
          </h4>
          <p className="text-sm text-blue-200/80">
            Auto-replies are disabled by default. You must explicitly enable them in{' '}
            <strong>Settings &gt; AI Configuration</strong>. We recommend running in "Draft Only"
            mode for the first week.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
