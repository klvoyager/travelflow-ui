'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Download, Send, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQuoteStore } from '@/store/quoteStore';
import { useAuth } from '@/lib/hooks/useAuth';

const MEAL_PLAN_LABELS: Record<string, string> = {
  RO: 'Room Only', BB: 'Bed & Breakfast', HB: 'Half Board',
  FB: 'Full Board', AI: 'All Inclusive', UAI: 'Ultra All Inclusive',
};

const HOTEL_CAT_LABELS: Record<string, string> = {
  '3_STAR': '3 Star', '4_STAR': '4 Star', '5_STAR': '5 Star', BOUTIQUE: 'Boutique',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function fmtD(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd MMM yyyy'); } catch { return d; }
}

export default function QuotePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuth();
  const { quotes } = useQuoteStore();

  const quote = quotes.find((q) => q.quotation_id === id);

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <Building2 className="h-12 w-12 opacity-30" />
        <p className="text-sm">Quote not found. <button className="text-brand-gold underline" onClick={() => router.back()}>Go back</button></p>
      </div>
    );
  }

  const hasChildren = quote.children_count > 0;
  const hasInfants = quote.infants_count > 0;

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Top action bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-2 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Builder
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">v{quote.version}</Badge>
          <Badge className={cn('text-xs', quote.status === 'DRAFT' ? 'bg-muted text-muted-foreground' : 'bg-blue-100 text-blue-700 border-blue-200')}>
            {quote.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => alert('PDF download coming in Phase 8')}>
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => alert('Send action available in Quote Builder')}>
            <Send className="h-3.5 w-3.5" /> Send to Guest
          </Button>
        </div>
      </div>

      {/* A4 document */}
      <div className="max-w-[794px] mx-auto my-8 px-4">
        <div className="bg-white shadow-xl rounded-sm overflow-hidden text-gray-800" style={{ minHeight: '1123px' }}>
          {/* Company header */}
          <div className="bg-gray-900 text-white px-10 py-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                  <Building2 className="h-7 w-7 text-white/80" />
                </div>
                <h1 className="text-xl font-bold tracking-wide">KL Voyager</h1>
                <p className="text-xs text-white/60 mt-0.5">Your Trusted Travel Partner</p>
              </div>
              <div className="text-right text-sm text-white/80 space-y-1">
                <p className="font-semibold text-white text-base">QUOTATION</p>
                <p className="font-mono text-xs">{quote.quotation_ref}</p>
                <p className="text-xs">Version {quote.version}</p>
                <p className="text-xs">Valid until: {fmtD(quote.valid_until)}</p>
                <div className="mt-2 text-[11px] space-y-0.5 text-white/60">
                  <p>123 Marine Lines, Mumbai 400020</p>
                  <p>GST: 27AAACK1234M1ZX</p>
                  <p>ops@klvoyager.com · +91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-8 space-y-8">
            {/* Guest details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prepared For</p>
                <p className="text-lg font-bold text-gray-900">{quote.guest_name}</p>
                <p className="text-sm text-gray-500">Ref: {quote.quotation_ref}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prepared By</p>
                <p className="font-semibold">{quote.prepared_by_name}</p>
                <p className="text-sm text-gray-500">KL Voyager</p>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* Trip overview */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4">{quote.trip_title}</h2>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Departure', value: fmtD(quote.departure_date) },
                  { label: 'Return', value: fmtD(quote.return_date) },
                  { label: 'Duration', value: `${quote.duration_days} nights` },
                  {
                    label: 'Travellers',
                    value: [
                      `${quote.adults_count} Adult${quote.adults_count > 1 ? 's' : ''}`,
                      hasChildren && `${quote.children_count} Child${quote.children_count > 1 ? 'ren' : ''}`,
                      hasInfants && `${quote.infants_count} Infant${quote.infants_count > 1 ? 's' : ''}`,
                    ].filter(Boolean).join(', '),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget options comparison */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Package Options</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Details</th>
                      {quote.budget_options.map((opt) => (
                        <th key={opt.option_id} className="px-4 py-3 text-center">
                          <div className="font-semibold text-gray-900">{opt.option_name}</div>
                          {opt.is_recommended && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Recommended</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Hotel', get: (o: typeof quote.budget_options[0]) => o.hotel_name || '—' },
                      { label: 'Category', get: (o: typeof quote.budget_options[0]) => HOTEL_CAT_LABELS[o.hotel_category] || o.hotel_category },
                      { label: 'Nights', get: (o: typeof quote.budget_options[0]) => String(o.nights || '—') },
                      { label: 'Meal Plan', get: (o: typeof quote.budget_options[0]) => MEAL_PLAN_LABELS[o.meal_plan] || o.meal_plan },
                      { label: 'Transport', get: (o: typeof quote.budget_options[0]) => o.transport_type || '—' },
                    ].map(({ label, get }, rowIdx) => (
                      <tr key={label} className={cn('border-b border-gray-100', rowIdx % 2 === 1 && 'bg-gray-50/50')}>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-500">{label}</td>
                        {quote.budget_options.map((opt) => (
                          <td key={opt.option_id} className="px-4 py-3 text-center text-sm text-gray-700">{get(opt)}</td>
                        ))}
                      </tr>
                    ))}

                    {/* Pricing rows */}
                    <tr className="border-b border-gray-200 border-t-2 bg-amber-50/30">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-500">Price / Adult</td>
                      {quote.budget_options.map((opt) => (
                        <td key={opt.option_id} className="px-4 py-3 text-center font-bold text-gray-900">
                          {opt.adult_pricing ? fmt(opt.adult_pricing.breakdown.final_selling_price) : '—'}
                        </td>
                      ))}
                    </tr>
                    {hasChildren && (
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-xs font-semibold text-gray-500">Price / Child (bed)</td>
                        {quote.budget_options.map((opt) => (
                          <td key={opt.option_id} className="px-4 py-3 text-center text-sm text-gray-700">
                            {opt.child_with_bed_pricing ? fmt(opt.child_with_bed_pricing.breakdown.final_selling_price) : '—'}
                          </td>
                        ))}
                      </tr>
                    )}
                    {hasChildren && (
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-xs font-semibold text-gray-500">Price / Child (no bed)</td>
                        {quote.budget_options.map((opt) => (
                          <td key={opt.option_id} className="px-4 py-3 text-center text-sm text-gray-700">
                            {opt.child_without_bed_pricing ? fmt(opt.child_without_bed_pricing.breakdown.final_selling_price) : '—'}
                          </td>
                        ))}
                      </tr>
                    )}
                    <tr className="bg-gray-900">
                      <td className="px-4 py-3 text-xs font-semibold text-white">Group Total</td>
                      {quote.budget_options.map((opt) => {
                        const adult = (opt.adult_pricing?.breakdown.final_selling_price ?? 0) * quote.adults_count;
                        const cwb = (opt.child_with_bed_pricing?.breakdown.final_selling_price ?? 0) * Math.max(0, quote.children_count - 1);
                        const cnb = (opt.child_without_bed_pricing?.breakdown.final_selling_price ?? 0);
                        const total = adult + cwb + cnb;
                        return (
                          <td key={opt.option_id} className="px-4 py-3 text-center font-bold text-white text-base">
                            {total > 0 ? fmt(total) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            {quote.budget_options.some((o) => o.inclusions.length > 0) && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Inclusions</p>
                  <ul className="space-y-1">
                    {quote.budget_options[0].inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {quote.budget_options[0].exclusions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Exclusions</p>
                    <ul className="space-y-1">
                      {quote.budget_options[0].exclusions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Separator className="bg-gray-100" />

            {/* Payment terms */}
            {quote.payment_terms && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Terms</p>
                <p className="text-sm text-gray-700 leading-relaxed">{quote.payment_terms}</p>
              </div>
            )}

            {/* Agent note */}
            {quote.agent_note && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">A note from your travel consultant</p>
                <p className="text-sm text-gray-700 italic leading-relaxed">{quote.agent_note}</p>
              </div>
            )}

            {/* T&C */}
            {quote.terms_and_conditions && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</p>
                <p className="text-[11px] text-gray-400 leading-relaxed whitespace-pre-line">{quote.terms_and_conditions}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-10 py-5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div>
                <span className="font-semibold text-gray-600">KL Voyager</span> · 123 Marine Lines, Mumbai 400020
                · IATA: 12345678 · GST: 27AAACK1234M1ZX
              </div>
              <div className="text-right">
                <p>Prepared by: <span className="font-medium text-gray-600">{quote.prepared_by_name}</span></p>
                <p>This quote is valid until {fmtD(quote.valid_until)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
