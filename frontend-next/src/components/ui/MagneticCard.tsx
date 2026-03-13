'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-tokens';

interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MagneticCard({ children, className }: MagneticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        "group relative bg-surface border border-border p-6 transition-colors duration-500",
        "hover:border-[rgba(170,255,0,0.3)]",
        tokens.radius.default,
        "overflow-hidden",
        className
      )}
    >
      {/* Moonlight Spotlight Effect */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ${tokens.colors.accentDim}, transparent 60%)`,
        }}
      />
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
