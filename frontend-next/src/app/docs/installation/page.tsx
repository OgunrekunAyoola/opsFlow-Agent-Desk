"use client";
import React from "react";
import { motion } from "framer-motion";
import { Download, Terminal, Server } from "lucide-react";

export default function InstallationPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Installation</h1>
        <p className="text-lg text-zinc-400">
          Deploy OpsFlow on your own infrastructure using Docker or Kubernetes.
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
          <Download className="text-blue-400" /> Docker Compose
        </h2>
        <p className="text-zinc-400">
          The easiest way to run OpsFlow locally or in production is with Docker Compose.
        </p>
        <div className="bg-zinc-950 p-4 rounded border border-white/10 overflow-x-auto">
          <code className="text-sm font-mono text-zinc-300">
            git clone https://github.com/opsflow/opsflow.git<br />
            cd opsflow<br />
            docker-compose up -d
          </code>
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
          <Server className="text-violet-400" /> Environment Variables
        </h2>
        <p className="text-zinc-400">
          Configure your deployment by creating a <code className="text-violet-300">.env</code> file.
        </p>
        <div className="bg-zinc-950 p-4 rounded border border-white/10 overflow-x-auto">
          <pre className="text-sm font-mono text-zinc-300">
{`DATABASE_URL="postgresql://user:pass@localhost:5432/opsflow"
REDIS_URL="redis://localhost:6379"
OPENAI_API_KEY="sk-..."
`}
          </pre>
        </div>
      </motion.section>
    </div>
  );
}
