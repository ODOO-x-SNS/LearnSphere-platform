import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-semibold text-text-secondary tracking-tight">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={clsx(
            'block w-full rounded-xl border bg-white pl-3.5 pr-9 py-2.5 text-sm text-text-primary shadow-xs',
            'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:shadow-sm',
            'hover:border-gray-300 cursor-pointer appearance-none transition-all duration-150',
            error ? 'border-danger-500' : 'border-border',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
}
