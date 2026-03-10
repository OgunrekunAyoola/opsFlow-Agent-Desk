"use client";
import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Growth",
    price: "$39",
    description: "Best for small teams getting started with AI support.",
    features: [
      "Up to 3 Agents",
      "Unlimited Tickets",
      "Basic AI Triage",
      "Email Support",
      "7-day Retention"
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$99",
    description: "For growing teams that need automation and scale.",
    features: [
      "Up to 10 Agents",
      "Advanced AI Triage & Auto-Reply",
      "RAG Knowledge Base",
      "Slack & Shopify Integration",
      "30-day Retention",
      "Priority Support"
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Full control, security, and dedicated support.",
    features: [
      "Unlimited Agents",
      "Custom AI Models",
      "SSO & Audit Logs",
      "Dedicated Success Manager",
      "Unlimited Retention",
      "SLA Guarantees"
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Simple, transparent pricing.
          </h1>
          <p className="text-xl text-zinc-400">
            Start for free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 border ${
                plan.highlight 
                  ? "border-blue-500 bg-zinc-900/50 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]" 
                  : "border-white/10 bg-zinc-900/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-zinc-500">/month</span>}
              </div>
              <p className="text-zinc-400 mb-8 h-12">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl font-bold transition-all ${
                plan.highlight
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}>
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
