'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Book, Terminal, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/10 pb-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Documentation</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Welcome to the OpsFlow Agent Desk documentation. Learn how to build, deploy, and manage
          your AI support agents.
        </p>
      </motion.div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: 'Quickstart Guide',
            desc: 'Get your first agent running in under 5 minutes.',
            icon: Book,
            href: '/docs/getting-started',
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
          },
          {
            title: 'API Reference',
            desc: 'Detailed endpoints for tickets, users, and webhooks.',
            icon: Terminal,
            href: '/docs/api/tickets',
            color: 'text-violet-400',
            bg: 'bg-violet-400/10',
          },
          {
            title: 'Integrations',
            desc: 'Connect Shopify, Stripe, and your CRM.',
            icon: Settings,
            href: '/docs/integrations',
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              href={item.href}
              className="group block p-6 rounded-2xl border border-white/10 bg-zinc-900/30 hover:bg-zinc-900 hover:border-white/20 transition-all duration-300 h-full"
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-400 mb-4">{item.desc}</p>
              <div className="flex items-center text-sm font-medium text-zinc-500 group-hover:text-white transition-colors">
                Read more{' '}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <h2>What is OpsFlow?</h2>
        <p>
          OpsFlow is an agent-oriented support platform. Unlike traditional helpdesks, OpsFlow puts
          AI agents at the center of the workflow.
        </p>
        <ul>
          <li>
            <strong>Triage Agent:</strong> Classifies and prioritizes incoming tickets.
          </li>
          <li>
            <strong>Response Agent:</strong> Drafts replies based on knowledge base.
          </li>
          <li>
            <strong>Action Agent:</strong> Executes tools like refunds or cancellations.
          </li>
        </ul>

        <div className="not-prose mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-900/20 to-violet-900/20 border border-blue-500/20">
          <h3 className="text-lg font-semibold text-blue-200 mb-2">Pro Tip</h3>
          <p className="text-blue-100/80">
            You can customize agent behavior in the{' '}
            <Link href="/docs/settings" className="underline hover:text-white">
              Settings
            </Link>{' '}
            panel.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
