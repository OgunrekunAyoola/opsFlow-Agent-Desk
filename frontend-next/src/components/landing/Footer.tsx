'use client';
import React from 'react';
import Link from 'next/link';
import { 
  IconBrandTwitter, 
  IconBrandGithub, 
  IconBrandLinkedin, 
  IconHexagon 
} from '@tabler/icons-react';

const LINKS = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Developers: ["Documentation", "API Reference", "Status", "GitHub"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Cookies"]
};

export function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-6">
              <span className="text-white">OpsFlow</span>
              <span className="text-accent">AI</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              The AI-native support platform built for modern, high-velocity teams. 
              Automate the routine, empower your agents.
            </p>
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-lg border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-accent/20 transition-all">
                <IconBrandTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-accent/20 transition-all">
                <IconBrandGithub size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-accent/20 transition-all">
                <IconBrandLinkedin size={18} />
              </a>
            </div>
          </div>

          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-6">
                {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-zinc-600">
            © 2026 OpsFlowAI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-accent text-[10px]">★</span>
                ))}
              </div>
              <span className="text-xs text-zinc-500">4.9/5 from 400+ reviews</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
