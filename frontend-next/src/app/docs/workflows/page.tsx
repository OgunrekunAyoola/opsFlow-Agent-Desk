"use client";
import React from "react";
import { motion } from "framer-motion";
import { GitBranch, Zap, Clock } from "lucide-react";

export default function WorkflowsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Workflows</h1>
        <p className="text-lg text-zinc-400">
          Automate complex processes with multi-step agent workflows.
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
          <GitBranch className="text-pink-400" /> Defining a Workflow
        </h2>
        <p className="text-zinc-400">
          Workflows are defined in JSON or through the visual editor. They consist of triggers, steps, and conditions.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" /> Triggers
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><strong>Ticket Created:</strong> Runs when a new ticket arrives.</li>
          <li><strong>Ticket Updated:</strong> Runs when status or priority changes.</li>
          <li><strong>Time Based:</strong> Runs on a schedule (e.g., SLA breach warning).</li>
        </ul>
      </motion.section>
    </div>
  );
}
