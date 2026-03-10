'use client';
import React from 'react';
import { Database, FileText, Search, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KnowledgeBaseDocsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Knowledge Base (RAG)</h1>
        <p className="text-lg text-zinc-400">
          Power your agents with your company's data. OpsFlow uses Retrieval-Augmented Generation
          (RAG) to provide accurate answers.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: UploadCloud,
              title: '1. Ingest',
              desc: 'Upload PDFs, Markdown files, or crawl your public documentation.',
            },
            {
              icon: Database,
              title: '2. Embed',
              desc: 'We convert your text into vector embeddings for semantic search.',
            },
            {
              icon: Search,
              title: '3. Retrieve',
              desc: 'Agents search for relevant context before generating a reply.',
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="p-6 rounded-xl border border-white/10 bg-zinc-900/30"
            >
              <step.icon className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400">{step.desc}</p>
            </motion.div>
          ))}
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
          <FileText className="text-violet-400" /> Managing Content
        </h2>
        <p className="text-zinc-400">
          Navigate to <strong>Settings &gt; Knowledge Base</strong> to manage your sources.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li>
            <strong>Documents:</strong> Upload policies, FAQs, and internal wikis.
          </li>
          <li>
            <strong>URLs:</strong> Add your help center URL (e.g., help.example.com).
          </li>
          <li>
            <strong>Text Snippets:</strong> Quickly add one-off rules or instructions.
          </li>
        </ul>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-zinc-900 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Best Practices</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Keep documents small and focused on a single topic.</li>
          <li>• Use clear headings and bullet points.</li>
          <li>• Update content regularly to prevent outdated answers.</li>
        </ul>
      </motion.div>
    </div>
  );
}
