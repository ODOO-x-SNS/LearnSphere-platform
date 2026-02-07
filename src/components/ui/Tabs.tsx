import { clsx } from 'clsx';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);
  const currentTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div className="flex gap-0.5 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-all duration-150',
              '-mb-px',
              active === tab.id
                ? 'text-primary-700'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab.icon}
            {tab.label}
            {active === tab.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-6 animate-fade-in">{currentTab?.content}</div>
    </div>
  );
}
