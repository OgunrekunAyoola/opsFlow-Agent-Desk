import * as React from 'react';
import { cn } from '../../lib/utils';

// Note: I'm implementing a simplified version without cva dependency first if I don't have it,
// but wait, I didn't install class-variance-authority. I should install it or just write standard react component.
// I'll stick to standard React component for now to save a tool call, or just install it quickly.
// Actually, I'll install class-variance-authority because it's standard for this kind of thing.

// Let me pause and install class-variance-authority and radix-ui/react-slot (useful for "asChild").
// Wait, I want to be fast. I'll just write a clean component without extra deps for now.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-grad-main text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]',
      secondary: 'bg-white border border-slate-200 text-accent-primary hover:bg-slate-50',
      ghost: 'text-text-muted hover:bg-slate-100 hover:text-text-primary',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20',
    };

    const sizes = {
      sm: 'h-8 px-4 text-xs',
      md: 'h-10 px-6 text-sm',
      lg: 'h-12 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
