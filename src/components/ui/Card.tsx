import { clsx } from 'clsx';
import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, className, padding = true, hover, onClick, style }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-border/80 shadow-xs',
        padding && 'p-6',
        hover && 'hover:shadow-md hover:border-primary-100 hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
