'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-tokens';
import { IconLoader2 } from '@tabler/icons-react';

interface GlowButtonProps {
  children: React.ReactNode;
  variant?: 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function GlowButton({
  children,
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  href,
  className,
}: GlowButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    buttonRef.current.style.setProperty('--glow-x', `${x}px`);
    buttonRef.current.style.setProperty('--glow-y', `${y}px`);
  };

  const baseStyles = cn(
    "relative inline-flex items-center justify-center overflow-hidden font-medium transition-all",
    tokens.easing.spring,
    "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
    size === 'sm' && "px-4 py-2 text-sm",
    size === 'md' && "px-6 py-3 text-base",
    size === 'lg' && "px-8 py-4 text-lg",
    variant === 'filled' 
      ? "bg-[#AAFF00] text-black hover:bg-[#BFFF33]" 
      : "bg-transparent border border-[#AAFF00] text-[#AAFF00] hover:bg-accentGlow",
    tokens.radius.default,
    className
  );

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {loading && <IconLoader2 className="animate-spin w-4 h-4" />}
        {!loading && children}
      </span>
      {/* Glow Effect */}
      <span 
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_var(--glow-x)_var(--glow-y),rgba(170,255,0,0.2)_0%,transparent_60%)] filter blur-xl"
      />
    </>
  );

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link 
          href={href} 
          className={cn(baseStyles, "group")}
          onMouseMove={handleMouseMove}
          ref={buttonRef as any}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      className={cn(baseStyles, "group")}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      ref={buttonRef as any}
    >
      {content}
    </motion.button>
  );
}
