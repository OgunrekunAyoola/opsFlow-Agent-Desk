import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-tokens';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span 
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r from-[#AAFF00] to-[#F5F5F5]",
        className
      )}
    >
      {children}
    </span>
  );
}
