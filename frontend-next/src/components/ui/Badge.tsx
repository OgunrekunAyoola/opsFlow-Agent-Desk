import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

const badgeVariants = {
  default: 'border-transparent bg-blue-600 text-white shadow hover:bg-blue-700',
  secondary: 'border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700',
  destructive: 'border-transparent bg-red-500 text-white shadow hover:bg-red-600',
  outline: 'text-slate-100 border-slate-700',
  success: 'border-transparent bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25',
  warning: 'border-transparent bg-amber-500/15 text-amber-400 hover:bg-amber-500/25',
};

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${badgeVariants[variant]} ${className}`} {...props} />
  );
}

export { Badge };
