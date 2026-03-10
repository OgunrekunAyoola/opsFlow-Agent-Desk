"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GettingStarted() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">
          Getting Started with OpsFlow
        </h1>
        <p className="text-lg text-zinc-400">Set up your first autonomous agent in minutes.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-xl border border-white/10 bg-zinc-900/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Prerequisites</h3>
          <ul className="space-y-2 text-zinc-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>OpsFlow Account</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Support Email (Gmail/Outlook)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>CRM API Key (Optional)</span>
            </li>
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 rounded-xl border border-white/10 bg-zinc-900/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">What you'll build</h3>
          <p className="text-zinc-400 mb-4">
            A fully autonomous triage agent that categorizes tickets and drafts replies.
          </p>
        </motion.div>
      </div>

      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">1. Connect your email</h2>
          <p className="text-zinc-400 mb-4">
            Navigate to{' '}
            <Link href="/docs/email-api-ingestion" className="text-blue-400 hover:underline">
              Email Ingestion
            </Link>{' '}
            and authenticate your support inbox. OpsFlow will start ingesting tickets automatically.
          </p>
          <div className="bg-zinc-950 rounded-lg p-4 border border-white/10 font-mono text-sm text-zinc-300">
            // Example configuration
            <br />
            IMAP Server: imap.gmail.com
            <br />
            Port: 993
            <br />
            Security: SSL/TLS
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">2. Configure Triage Rules</h2>
          <p className="text-zinc-400 mb-4">
            Define how the AI should categorize incoming tickets. You can use natural language
            instructions.
          </p>
          <div className="bg-zinc-950 rounded-lg p-4 border border-white/10 font-mono text-sm text-zinc-300">
            If a ticket mentions "refund" or "chargeback", categorize as "Billing" and set Priority
            to "High".
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">3. Enable Auto-Draft</h2>
          <p className="text-zinc-400 mb-4">
            Turn on the Response Agent to start generating draft replies based on your knowledge
            base.
          </p>
        </motion.section>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="pt-8 border-t border-white/10"
      >
        <Link
          href="/docs/ai-copilot"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Next: Understanding Agents <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
