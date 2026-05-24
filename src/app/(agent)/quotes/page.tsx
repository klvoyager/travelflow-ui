'use client';

import { useRouter } from 'next/navigation';
import { format, parseISO, differenceInDays } from 'date-fns';
import { FileText, Eye, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useQuoteStore } from '@/store/quoteStore';
import type { Quotation } from '@/lib/types';

const STATUS_COLORS: Record<Quotation['status'], string> = {
  DRAFT:              'bg-muted text-muted-foreground border-border',
  SENT:               'bg-blue-100 text-blue-700 border-blue-200',
  VIEWED:             'bg-purple-100 text-purple-700 border-purple-200',
  ACCEPTED:           'bg-green-100 text-green-700 border-green-200',
  REVISION_REQUESTED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  EXPIRED:            'bg-red-100 text-red-600 border-red-200',
  REJECTED:           'bg-gray-100 text-gray-500 border-gray-200',
};

function ValidityBadge({ date }: { date: string }) {
  const days = differenceInDays(parseISO(date), new Date());
  if (days < 0) return <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Expired</span>;
  if (days <= 3) return <span className="text-xs text-yellow-600">Expires in {days}d</span>;
  return <span className="text-xs text-muted-foreground">Valid until {format(parseISO(date), 'dd MMM')}</span>;
}

export default function QuotesPage() {
  const router = useRouter();
  const { quotes } = useQuoteStore();

  const sorted = [...quotes].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Quotes</h1>
        <p className="text-sm text-muted-foreground">{quotes.length} total</p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No quotes yet"
          description="Quotes are created from the Quote Builder inside an enquiry."
          icon={FileText}
          className="py-16"
        />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Ref', 'Guest', 'Trip', 'Options', 'Status', 'Valid Until', 'Version', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((q, idx) => (
                <tr
                  key={q.quotation_id}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-muted/20 cursor-pointer ${idx % 2 === 1 ? 'bg-muted/10' : ''}`}
                  onClick={() => router.push(`/quotes/${q.quotation_id}/preview`)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-brand-gold font-medium">{q.quotation_ref}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{q.guest_name}</p>
                    <p className="text-xs text-muted-foreground">{q.prepared_by_name}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-sm truncate">{q.trip_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.departure_date ? format(parseISO(q.departure_date), 'dd MMM yyyy') : '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {q.budget_options.map((o) => (
                        <Badge key={o.option_id} variant="outline" className="text-[10px] px-1.5">
                          {o.option_name}
                          {o.is_recommended && ' ★'}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium border rounded px-2 py-0.5 ${STATUS_COLORS[q.status]}`}>
                      {q.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ValidityBadge date={q.valid_until} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">v{q.version}</Badge>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => router.push(`/quotes/${q.quotation_id}/preview`)}
                    >
                      <Eye className="h-3 w-3" /> Preview
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
