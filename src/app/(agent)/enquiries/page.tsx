'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, AlertTriangle, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { EnquiryStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEnquiries, type EnquiryFilters } from '@/lib/hooks/useEnquiries';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDate, formatRelative } from '@/lib/utils';
import type { Enquiry, EnquiryStatus } from '@/lib/types';

type TabKey = 'all' | 'mine' | 'sla' | 'unassigned' | 'closed';

const TAB_FILTERS: Record<TabKey, Partial<EnquiryFilters>> = {
  all:        {},
  mine:       {},  // injected with currentUser.user_id in component
  sla:        { slaBreached: true },
  unassigned: {},  // handled manually
  closed:     { status: ['ENQUIRY_CLOSED', 'BOOKING_CONFIRMED'] },
};

function LeadScoreBar({ score }: { score?: number }) {
  if (!score) return <span className="text-muted-foreground text-xs">—</span>;
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{score}</span>
    </div>
  );
}

function SLACell({ due, breached }: { due?: string; breached: boolean }) {
  if (!due) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className={breached ? 'text-red-600 font-medium flex items-center gap-1 text-xs' : 'text-xs text-muted-foreground'}>
      {breached && <AlertTriangle className="h-3 w-3 shrink-0" />}
      {formatRelative(due)}
    </div>
  );
}

const ENQUIRY_COLUMNS: ColumnDef<Enquiry>[] = [
  {
    accessorKey: 'enquiry_ref',
    header: 'Ref',
    size: 160,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-brand-gold font-medium">{row.original.enquiry_ref}</span>
    ),
  },
  {
    accessorKey: 'customer_name',
    header: 'Guest',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.customer_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.customer_email}</p>
      </div>
    ),
  },
  {
    id: 'destinations',
    header: 'Destination',
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.destinations.map(d => d.country).join(', ')}
      </span>
    ),
  },
  {
    accessorKey: 'enquiry_type',
    header: 'Type',
    size: 100,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.enquiry_type.replace('_', ' ')}</span>
    ),
  },
  {
    accessorKey: 'enquiry_status',
    header: 'Status',
    cell: ({ row }) => <EnquiryStatusBadge status={row.original.enquiry_status} />,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    size: 90,
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
  },
  {
    accessorKey: 'assigned_agent_name',
    header: 'Agent',
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs">{row.original.assigned_agent_name ?? '—'}</span>
    ),
  },
  {
    id: 'sla',
    header: 'SLA Due',
    size: 110,
    cell: ({ row }) => (
      <SLACell due={row.original.sla_quote_due} breached={row.original.sla_breached} />
    ),
  },
  {
    accessorKey: 'lead_score',
    header: 'Score',
    size: 110,
    cell: ({ row }) => <LeadScoreBar score={row.original.lead_score} />,
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    size: 100,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.created_at)}</span>
    ),
  },
];

export default function EnquiriesPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const buildFilters = useCallback((): EnquiryFilters => {
    const base = { ...TAB_FILTERS[activeTab] };
    if (activeTab === 'mine') base.assignedAgent = currentUser.user_id;
    if (search) base.search = search;
    return base;
  }, [activeTab, search, currentUser.user_id]);

  const { enquiries, allEnquiries, isLoading, totalCount, totalPages } = useEnquiries(
    buildFilters(),
    { page, pageSize }
  );

  // Filter unassigned manually (no assigned_agent_id)
  const displayEnquiries = activeTab === 'unassigned'
    ? enquiries.filter(e => !e.assigned_agent_id)
    : enquiries;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabKey);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const slaCount = allEnquiries.filter(e => e.sla_breached).length;
  const unassignedCount = allEnquiries.filter(e => !e.assigned_agent_id).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Enquiries</h1>
          <p className="text-sm text-muted-foreground">{totalCount} total</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="mine" className="text-xs">My Enquiries</TabsTrigger>
          <TabsTrigger value="sla" className="text-xs gap-1.5">
            SLA Breached
            {slaCount > 0 && (
              <Badge className="h-4 px-1 text-[10px] bg-red-500 border-0">{slaCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="text-xs gap-1.5">
            Unassigned
            {unassignedCount > 0 && (
              <Badge className="h-4 px-1 text-[10px] bg-muted-foreground border-0">{unassignedCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="closed" className="text-xs">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ref, guest, destination…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={ENQUIRY_COLUMNS}
        data={displayEnquiries}
        isLoading={isLoading}
        onRowClick={row => router.push(`/enquiries/${row.enquiry_id}`)}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
        rowClassName={row => row.sla_breached ? 'border-l-2 border-l-red-500' : ''}
        emptyState={
          <EmptyState
            title="No enquiries found"
            description={search ? 'Try a different search term.' : 'No enquiries match the selected filter.'}
            icon={ClipboardList}
            className="py-12"
          />
        }
      />
    </div>
  );
}
