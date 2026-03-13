'use client';

import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, duration = 0.5, className }: FadeUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 24, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
