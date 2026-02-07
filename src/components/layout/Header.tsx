import { Search, Bell } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border/60 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="w-64 pl-9 pr-3 py-2 rounded-xl border border-border text-sm bg-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                onBlur={() => setSearchOpen(false)}
              />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            )}
            {searchOpen && <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          {actions && <div className="w-px h-6 bg-border mx-1" />}

          {/* Actions slot */}
          {actions}
        </div>
      </div>
    </header>
  );
}
