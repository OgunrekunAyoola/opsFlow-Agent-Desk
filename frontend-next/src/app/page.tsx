import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/ui/Hero";
import { BentoGrid } from "@/components/ui/BentoGrid";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <BentoGrid />
      
      {/* Social Proof / Trusted By */}
      <section className="py-12 border-y border-white/5 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-8">
            Trusted by forward-thinking teams
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos would go here (SVGs) - Using text placeholders for now */}
            {['Acme Corp', 'Globex', 'Soylent', 'Umbrella', 'Initech'].map((name) => (
              <span key={name} className="text-xl font-bold text-white/40 hover:text-white transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-blue-900/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to automate your support?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Join thousands of teams providing faster, smarter support with OpsFlow.
          </p>
          <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
            Start your free trial
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
