import { clsx } from 'clsx';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-text-primary shadow-xs',
          'placeholder:text-text-muted/70 transition-all resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:shadow-sm',
          'hover:border-gray-300',
          error ? 'border-danger-500' : 'border-border',
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
