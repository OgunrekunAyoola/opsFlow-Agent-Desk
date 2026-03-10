'use client';
import React from 'react';
import { Users, Lock, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsDocsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">
          Settings & Configuration
        </h1>
        <p className="text-lg text-zinc-400">Manage your team, security, and global preferences.</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Users className="text-blue-400" /> Team Management
        </h2>
        <p className="text-zinc-400">
          Invite team members and assign roles. OpsFlow supports Role-Based Access Control (RBAC).
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border border-white/10 bg-zinc-900/30">
            <h3 className="font-semibold text-white mb-1">Admin</h3>
            <p className="text-sm text-zinc-400">
              Full access to settings, billing, and all tickets.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-white/10 bg-zinc-900/30">
            <h3 className="font-semibold text-white mb-1">Agent</h3>
            <p className="text-sm text-zinc-400">
              Can view and reply to tickets. Cannot change global settings.
            </p>
          </div>
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
          <Key className="text-yellow-400" /> API Keys
        </h2>
        <p className="text-zinc-400">
          Generate API keys for external integrations. Keep these secret.
        </p>
        <div className="bg-zinc-950 p-4 rounded border border-white/10">
          <code className="text-blue-400 text-sm">sk_live_51Mz...</code>
        </div>
      </motion.section>
    </div>
  );
}
