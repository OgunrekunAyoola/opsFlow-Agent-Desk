'use client';

import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (latest) => 
    `${prefix}${latest.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  );

  useEffect(() => {
    if (isInView) {
      count.set(value);
    }
  }, [isInView, value, count]);

  return <motion.span ref={ref}>{display}</motion.span>;
}
