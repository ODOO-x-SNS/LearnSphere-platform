import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-semibold text-text-secondary tracking-tight">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-text-primary shadow-xs',
          'placeholder:text-text-muted/70 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:shadow-sm',
          'hover:border-gray-300',
          error ? 'border-danger-500 focus:ring-danger-200' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
