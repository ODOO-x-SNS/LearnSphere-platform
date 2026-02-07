import { useState } from 'react';
import { Shield, Filter, Clock, User, FileText, Search } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, Badge, Select, TableSkeleton, EmptyState } from '../../components/ui';
import { useAuditLogs } from '../../hooks/useApi';
import { clsx } from 'clsx';

const actionColors: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'danger',
  PUBLISH: 'success',
  UNPUBLISH: 'warning',
};

export function AuditPage() {
  const [resourceType, setResourceType] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAuditLogs({ resourceType: resourceType || undefined, search: search || undefined });
  const logs = data?.data || [];

  return (
    <div>
      <Header
        title="Audit Logs"
        subtitle="Track all system activity and changes"
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-text-muted flex-shrink-0" />
            <Select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              options={[
                { value: '', label: 'All Resources' },
                { value: 'Course', label: 'Courses' },
                { value: 'Lesson', label: 'Lessons' },
                { value: 'Quiz', label: 'Quizzes' },
                { value: 'User', label: 'Users' },
              ]}
              className="w-48"
            />
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 hover:border-gray-300 transition-all"
              />
            </div>
          </div>
        </Card>

        {/* Timeline */}
        {isLoading ? (
          <Card><TableSkeleton rows={6} cols={4} /></Card>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-12 w-12" />}
            title="No audit logs"
            description="Activity will appear here once actions are performed"
          />
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <Card key={log.id} hover className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` } as React.CSSProperties}>
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs',
                    log.action.includes('DELETE') ? 'bg-danger-50 ring-1 ring-danger-100' :
                    log.action.includes('CREATE') ? 'bg-success-50 ring-1 ring-success-100' :
                    'bg-primary-50 ring-1 ring-primary-100'
                  )}>
                    <Shield className={clsx(
                      'h-5 w-5',
                      log.action.includes('DELETE') ? 'text-danger-500' :
                      log.action.includes('CREATE') ? 'text-success-500' :
                      'text-primary-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-primary">
                        {log.actorName || log.actorId}
                      </span>
                      <Badge variant={
                        (actionColors[log.action] as 'success' | 'primary' | 'danger' | 'warning') || 'default'
                      }>
                        {log.action}
                      </Badge>
                      <Badge variant="default">{log.resourceType}</Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Resource ID: {log.resourceId}
                    </p>
                    {log.data && Object.keys(log.data).length > 0 && (
                      <div className="mt-2 p-2 bg-surface-dim rounded-lg text-xs text-text-secondary font-mono overflow-x-auto">
                        {JSON.stringify(log.data, null, 2).slice(0, 200)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
