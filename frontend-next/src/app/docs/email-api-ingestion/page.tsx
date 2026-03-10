'use client';
import React from 'react';
import { Mail, ArrowRightLeft, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmailIngestionDocsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Email Integration</h1>
        <p className="text-lg text-zinc-400">
          Connect your support email to start processing tickets.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white">Setup Methods</h2>
        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-xl border border-white/10 bg-zinc-900/30 flex gap-4"
          >
            <div className="p-3 rounded-lg bg-blue-500/10 h-fit">
              <ArrowRightLeft className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Email Forwarding (Recommended)</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Set up a forwarding rule in Gmail/Outlook to send emails to your unique OpsFlow
                address.
              </p>
              <div className="bg-black rounded border border-white/10 p-3 font-mono text-xs text-zinc-300">
                support@your-tenant.opsflow.ai
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-xl border border-white/10 bg-zinc-900/30 flex gap-4"
          >
            <div className="p-3 rounded-lg bg-violet-500/10 h-fit">
              <Server className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">IMAP / SMTP</h3>
              <p className="text-zinc-400 text-sm">
                Connect directly to your mail server. Requires providing credentials.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Mail className="text-emerald-400" /> Outbound Emails
        </h2>
        <p className="text-zinc-400">
          To ensure emails land in customers' inboxes, you should configure SPF and DKIM records if
          using a custom domain.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-400">
            <thead className="border-b border-white/10 text-white">
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Host</th>
                <th className="py-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-2">TXT</td>
                <td className="py-2">@</td>
                <td className="py-2 font-mono text-xs">v=spf1 include:opsflow.ai ~all</td>
              </tr>
              <tr>
                <td className="py-2">CNAME</td>
                <td className="py-2">opsflow._domainkey</td>
                <td className="py-2 font-mono text-xs">dkim.opsflow.ai</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
