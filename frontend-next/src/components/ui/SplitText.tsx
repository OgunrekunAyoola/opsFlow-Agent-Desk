'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FadeUp } from './FadeUp';

interface SplitTextProps {
  text: string;
  staggerDelay?: number;
  delay?: number;
  className?: string;
}

export function SplitText({ text, staggerDelay = 0.06, delay = 0, className }: SplitTextProps) {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.2em] last:mr-0">
          <FadeUp 
            delay={delay + (i * staggerDelay)} 
            duration={0.8}
            className="inline-block"
          >
            {word}
          </FadeUp>
        </span>
      ))}
    </span>
  );
}
