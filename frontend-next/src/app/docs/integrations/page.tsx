"use client";
import React from "react";
import { motion } from "framer-motion";
import { Plug, ShoppingBag, CreditCard } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Integrations</h1>
        <p className="text-lg text-zinc-400">
          Connect OpsFlow with your existing tools and services.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-xl border border-white/10 bg-zinc-900/30"
        >
          <ShoppingBag className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Shopify</h3>
          <p className="text-zinc-400 mb-4">
            View customer orders, refund items, and check shipping status directly from the ticket view.
          </p>
          <div className="text-sm text-green-400 font-medium">Available</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 rounded-xl border border-white/10 bg-zinc-900/30"
        >
          <CreditCard className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Stripe</h3>
          <p className="text-zinc-400 mb-4">
            Manage subscriptions, view payment history, and handle disputes.
          </p>
          <div className="text-sm text-blue-400 font-medium">Available</div>
        </motion.div>
      </div>
    </div>
  );
}
