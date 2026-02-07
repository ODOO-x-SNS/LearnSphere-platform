import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, DollarSign, Users, Lock, Globe } from 'lucide-react';
import { Button, Input, Select } from '../../../components/ui';
import { toast } from '../../../components/ui/Toast';
import { clsx } from 'clsx';
import type { Course } from '../../../types';

interface Props {
  course: Course;
  onSave: (data: Partial<Course>) => Promise<unknown>;
}

const accessRules = [
  {
    value: 'OPEN' as const,
    label: 'Open Access',
    description: 'Anyone can enroll without restrictions',
    icon: Globe,
    color: 'text-success-600 bg-success-50 border-success-200',
  },
  {
    value: 'PAYMENT' as const,
    label: 'Paid Access',
    description: 'Learners must pay to enroll',
    icon: DollarSign,
    color: 'text-warning-600 bg-warning-50 border-warning-200',
  },
  {
    value: 'INVITATION' as const,
    label: 'Invitation Only',
    description: 'Only invited learners can access',
    icon: Lock,
    color: 'text-accent-600 bg-accent-50 border-accent-200',
  },
];

export function OptionsTab({ course, onSave }: Props) {
  const [visibility, setVisibility] = useState(course.visibility || 'EVERYONE');
  const [accessRule, setAccessRule] = useState(course.accessRule || 'OPEN');
  const [price, setPrice] = useState(course.price?.toString() || '');

  useEffect(() => {
    setVisibility(course.visibility || 'EVERYONE');
    setAccessRule(course.accessRule || 'OPEN');
    setPrice(course.price?.toString() || '');
  }, [course]);

  const handleSave = async () => {
    try {
      await onSave({
        visibility,
        accessRule,
        price: accessRule === 'PAYMENT' ? parseFloat(price) || 0 : undefined,
      });
      toast('success', 'Options saved');
    } catch {
      toast('error', 'Failed to save options');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Course Options</h3>
        <p className="text-sm text-text-muted">Configure visibility, access rules, and pricing</p>
      </div>

      {/* Visibility */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-secondary">Visibility</label>
        <Select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Course['visibility'])}
          options={[
            { value: 'EVERYONE', label: 'Everyone — Visible to all users' },
            { value: 'SIGNED_IN', label: 'Signed In — Only visible to authenticated users' },
          ]}
        />
      </div>

      {/* Access Rule */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-secondary">Access Rule</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {accessRules.map((rule) => (
            <button
              key={rule.value}
              type="button"
              onClick={() => setAccessRule(rule.value)}
              className={clsx(
                'relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center',
                accessRule === rule.value
                  ? rule.color + ' shadow-sm'
                  : 'border-border bg-white hover:border-gray-300'
              )}
            >
              <div className={clsx(
                'w-11 h-11 rounded-xl flex items-center justify-center',
                accessRule === rule.value ? 'bg-white/80' : 'bg-surface-dim'
              )}>
                <rule.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{rule.label}</p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{rule.description}</p>
              </div>
              {accessRule === rule.value && (
                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-current" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price (conditional) */}
      {accessRule === 'PAYMENT' && (
        <div className="animate-fade-in space-y-3">
          <label className="block text-sm font-medium text-text-secondary">Price</label>
          <div className="relative max-w-xs">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.99"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <p className="text-xs text-text-muted">Set the enrollment fee in USD</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-surface-dim rounded-xl p-4 border border-border">
        <p className="text-xs font-medium text-text-muted mb-2">Tips</p>
        <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
          <li>Free courses get the most enrollments and visibility</li>
          <li>Invitation-only works best for private training programs</li>
          <li>Set a website URL in the Description tab before publishing</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button icon={<Save className="h-4 w-4" />} onClick={handleSave}>
          Save Options
        </Button>
      </div>
    </div>
  );
}
