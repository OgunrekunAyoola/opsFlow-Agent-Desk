import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', type, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>}
      <input
        type={type}
        className={`flex h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-sm text-slate-100 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className} ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
