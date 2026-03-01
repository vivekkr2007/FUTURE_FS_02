import type { LeadStatus } from '@/lib/supabase-types';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'status-badge-new' },
  contacted: { label: 'Contacted', className: 'status-badge-contacted' },
  converted: { label: 'Converted', className: 'status-badge-converted' },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
