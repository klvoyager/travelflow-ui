'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EnquiryStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEnquiries } from '@/lib/hooks/useEnquiries';
import { formatDate } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';

export function RecentEnquiries() {
  const { enquiries, isLoading } = useEnquiries();
  const recent = [...enquiries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Enquiries</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            description="New enquiries will appear here"
            icon={ClipboardList}
            className="py-10"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Ref</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Guest</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Destination</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Priority</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((enq, idx) => (
                  <tr
                    key={enq.enquiry_id}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? 'bg-muted/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/enquiries/${enq.enquiry_id}`}
                        className="font-mono text-xs text-brand-gold hover:underline"
                      >
                        {enq.enquiry_ref}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">{enq.customer_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {enq.destinations.map(d => d.country).join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      <EnquiryStatusBadge status={enq.enquiry_status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <PriorityBadge priority={enq.priority} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {formatDate(enq.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
