"use client";
import React from "react";
import { motion } from "framer-motion";
import { Ticket, List } from "lucide-react";

export default function ApiTicketsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Tickets API</h1>
        <p className="text-lg text-zinc-400">
          Create, read, update, and delete support tickets programmatically.
        </p>
      </motion.div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <List className="text-blue-400" /> List Tickets
        </h2>
        <div className="bg-zinc-950 p-4 rounded border border-white/10 overflow-x-auto">
          <code className="text-sm font-mono text-green-400">GET /api/v1/tickets</code>
        </div>
        <p className="text-zinc-400">
          Returns a paginated list of tickets.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Ticket className="text-violet-400" /> Create Ticket
        </h2>
        <div className="bg-zinc-950 p-4 rounded border border-white/10 overflow-x-auto">
          <code className="text-sm font-mono text-yellow-400">POST /api/v1/tickets</code>
        </div>
        <p className="text-zinc-400">
          Creates a new ticket. Requires <code>subject</code> and <code>description</code>.
        </p>
      </section>
    </div>
  );
}
