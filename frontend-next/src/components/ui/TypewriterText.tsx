'use client';

import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
}

export function TypewriterText({ text, speed = 40, startDelay = 0, className }: TypewriterTextProps) {
  const [complete, setComplete] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const display = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    const controls = animate(count, text.length, {
      duration: (text.length * speed) / 1000,
      delay: startDelay / 1000,
      ease: "linear",
      onComplete: () => setComplete(true),
    });
    return controls.stop;
  }, [text, speed, startDelay, count]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <motion.span>{display}</motion.span>
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={cn(
          "inline-block w-[2px] h-[1.1em] bg-accent ml-1",
          complete && "animate-pulse"
        )}
      />
    </span>
  );
}
