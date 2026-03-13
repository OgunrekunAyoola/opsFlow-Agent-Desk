'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-tokens';
import { GlowButton } from '../ui/GlowButton';

export function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Product', href: '#product' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Docs', href: '#docs' },
    { name: 'Changelog', href: '#changelog' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-[100] h-16 border-b border-border bg-[rgba(10,10,10,0.85)] backdrop-blur-md flex items-center px-6"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 tracking-tighter">
            <span className="text-textPrimary font-bold text-xl">OpsFlow</span>
            <span className="text-accent font-bold text-xl ml-0.5">AI</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-textMuted hover:text-textPrimary transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <GlowButton variant="ghost" size="sm" href="/login">
              Sign in
            </GlowButton>
            <GlowButton variant="filled" size="sm" href="/signup">
              Get started
            </GlowButton>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-textPrimary"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <IconMenu2 className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', ...tokens.easing }}
            className="fixed inset-0 z-[200] bg-bg flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-12">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <span className="text-textPrimary font-bold text-xl tracking-tighter">OpsFlow</span>
                <span className="text-accent font-bold text-xl ml-0.5 tracking-tighter">AI</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <IconX className="w-6 h-6 text-textMuted" />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-semibold text-textPrimary border-b border-border pb-4"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <GlowButton variant="ghost" size="lg" className="w-full" href="/login">
                Sign in
              </GlowButton>
              <GlowButton variant="filled" size="lg" className="w-full" href="/signup">
                Get started
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
