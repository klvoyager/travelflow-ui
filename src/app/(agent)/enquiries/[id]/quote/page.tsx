'use client';

import { use, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInDays, format, parseISO, addDays } from 'date-fns';
import {
  ArrowLeft, Save, Eye, Send, Plus, Trash2, Loader2,
  Sparkles, ChevronDown, ChevronUp, GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PricingEnginePanel } from '@/components/quote/PricingEnginePanel';
import { ItineraryBuilder } from '@/components/quote/ItineraryBuilder';
import { cn, formatDateTime } from '@/lib/utils';
import { useEnquiry } from '@/lib/hooks/useEnquiries';
import { useProposals } from '@/lib/hooks/useDMC';
import { useQuote, calculatePricing } from '@/lib/hooks/useQuote';
import { useQuoteStore } from '@/store/quoteStore';
import { useEnquiryStore } from '@/store/enquiryStore';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Quotation, BudgetOption, BudgetOptionName, PricingBreakdown, ItineraryDay } from '@/lib/types';

const OPTION_NAMES: BudgetOptionName[] = ['Standard', 'Deluxe', 'Luxury', 'Budget'];
const MEAL_PLANS = ['RO', 'BB', 'HB', 'FB', 'AI', 'UAI'];
const HOTEL_CATS = ['3_STAR', '4_STAR', '5_STAR', 'BOUTIQUE'] as const;
const DEFAULT_T_AND_C = `All prices are per person in INR. Rates are subject to availability at the time of booking.
Prices may vary based on room type, season, and airline availability.
TravelFlow AI acts as an agent and is not responsible for any changes made by the supplier.
Force majeure events are beyond our control and may result in itinerary changes.`;

function DatePickerButton({ value, onChange, placeholder }: {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('h-9 text-sm justify-start font-normal w-full', !value && 'text-muted-foreground')}>
          {value ? format(parseISO(value), 'dd MMM yyyy') : placeholder || 'Pick date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => { if (d) { onChange(format(d, 'yyyy-MM-dd')); setOpen(false); } }}
        />
      </PopoverContent>
    </Popover>
  );
}

function BulletBuilder({ value, onChange, placeholder }: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed) { onChange([...value, trimmed]); setDraft(''); }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" variant="outline" onClick={add} className="h-8 px-2">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm bg-muted/30 rounded px-2 py-1">
              <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="flex-1">{item}</span>
              <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function makeNewOption(name: BudgetOptionName, idx: number): BudgetOption {
  return {
    option_id: `bopt-new-${Date.now()}-${idx}`,
    option_name: name,
    sort_order: idx,
    hotel_name: '',
    hotel_category: '4_STAR',
    nights: 0,
    meal_plan: 'BB',
    inclusions: [],
    exclusions: [],
    is_recommended: idx === 0,
  };
}

function makeNewQuote(enquiry: NonNullable<ReturnType<typeof useEnquiry>['enquiry']>, agentId: string, agentName: string): Quotation {
  const today = new Date();
  return {
    quotation_id: `qt-new-${Date.now()}`,
    quotation_ref: `QT-KLVOY-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`,
    enquiry_id: enquiry.enquiry_id,
    tenant_id: enquiry.tenant_id,
    version: 1,
    status: 'DRAFT',
    trip_title: `${enquiry.destinations.map((d) => d.country).join(' + ')} — ${format(today, 'MMMM yyyy')}`,
    guest_name: enquiry.customer_name,
    departure_date: enquiry.departure_date_preferred || format(addDays(today, 30), 'yyyy-MM-dd'),
    return_date: format(addDays(today, 30 + (enquiry.duration_days || 7)), 'yyyy-MM-dd'),
    duration_days: enquiry.duration_days || 7,
    adults_count: enquiry.adults_count,
    children_count: enquiry.children_count,
    infants_count: enquiry.infants_count,
    budget_options: [makeNewOption('Standard', 0)],
    currency: 'INR',
    valid_until: format(addDays(today, 7), 'yyyy-MM-dd'),
    payment_terms: '30% advance on confirmation. Balance 30 days before departure.',
    cancellation_policy: 'Free cancellation up to 45 days before departure. 50% charges within 30 days.',
    terms_and_conditions: DEFAULT_T_AND_C,
    prepared_by_id: agentId,
    prepared_by_name: agentName,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  };
}

export default function QuoteBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuth();
  const { enquiry } = useEnquiry(id);
  const { proposals } = useProposals(id);
  const { quote: savedQuote } = useQuote(id);
  const { saveDraft } = useQuoteStore();
  const { updateStatus } = useEnquiryStore();

  const [quote, setQuote] = useState<Quotation | null>(null);
  const [activeTab, setActiveTab] = useState('0');
  const [saving, setSaving] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Itinerary actions read straight from the store so drag-reorder is responsive
  const itineraryDays = useQuoteStore((s) => {
    const id = quote?.quotation_id;
    if (!id) return [] as ItineraryDay[];
    return s.quotes.find((q) => q.quotation_id === id)?.itinerary_days ?? [];
  });
  const addItineraryDay = useQuoteStore((s) => s.addItineraryDay);
  const updateItineraryDay = useQuoteStore((s) => s.updateItineraryDay);
  const removeItineraryDay = useQuoteStore((s) => s.removeItineraryDay);
  const reorderItineraryDays = useQuoteStore((s) => s.reorderItineraryDays);
  const importFromPackage = useQuoteStore((s) => s.importFromPackage);

  // Init quote from store or create new. New quotes are saved to the store
  // immediately so itinerary actions (which target by quotation_id) have a row to mutate.
  useEffect(() => {
    if (!enquiry) return;
    if (savedQuote) {
      setQuote(savedQuote);
    } else {
      const fresh = makeNewQuote(enquiry, currentUser.user_id, currentUser.full_name);
      setQuote(fresh);
      saveDraft(fresh);
    }
  }, [enquiry, savedQuote, currentUser, saveDraft]);

  const update = useCallback((patch: Partial<Quotation>) => {
    setQuote((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  const updateOption = useCallback((optionId: string, patch: Partial<BudgetOption>) => {
    setQuote((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        budget_options: prev.budget_options.map((o) =>
          o.option_id === optionId ? { ...o, ...patch } : o
        ),
      };
    });
  }, []);

  const addOption = () => {
    if (!quote || quote.budget_options.length >= 4) return;
    const usedNames = quote.budget_options.map((o) => o.option_name);
    const next = OPTION_NAMES.find((n) => !usedNames.includes(n));
    if (!next) return;
    const newOpt = makeNewOption(next, quote.budget_options.length);
    update({ budget_options: [...quote.budget_options, newOpt] });
    setActiveTab(String(quote.budget_options.length));
  };

  const removeOption = (optionId: string) => {
    if (!quote || quote.budget_options.length <= 1) return;
    const filtered = quote.budget_options.filter((o) => o.option_id !== optionId);
    update({ budget_options: filtered });
    setActiveTab('0');
  };

  // Auto-calc duration from dates
  const handleDepartureChange = (date: string) => {
    if (!quote) return;
    const dep = parseISO(date);
    const ret = quote.return_date ? parseISO(quote.return_date) : addDays(dep, quote.duration_days || 7);
    const days = differenceInDays(ret, dep);
    update({ departure_date: date, duration_days: Math.max(0, days) });
  };

  const handleReturnChange = (date: string) => {
    if (!quote) return;
    const dep = quote.departure_date ? parseISO(quote.departure_date) : new Date();
    const days = differenceInDays(parseISO(date), dep);
    update({ return_date: date, duration_days: Math.max(0, days) });
  };

  const handleSave = async (sendAfter = false) => {
    if (!quote) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    // Itinerary lives in the store (updated live by ItineraryBuilder).
    // Merge it in so we don't clobber it with stale local state.
    saveDraft({ ...quote, itinerary_days: itineraryDays });
    setLastSaved(new Date().toISOString());
    setSaving(false);
    if (!sendAfter) toast.success('Draft saved');
  };

  const handleSendToGuest = async () => {
    if (!quote || !enquiry) return;
    await handleSave(true);
    const sent: Quotation = {
      ...quote,
      itinerary_days: itineraryDays,
      status: 'SENT',
      sent_at: new Date().toISOString(),
      version: quote.version + 1,
    };
    saveDraft(sent);
    setQuote(sent);
    updateStatus(id, 'QUOTE_SENT', currentUser.full_name, currentUser.user_id, `Quote v${sent.version} sent to ${enquiry.customer_name}`);
    toast.success('Quote sent to guest');
    setSendDialogOpen(false);
  };

  // Pull from DMC proposal
  const applyProposalOption = (optionId: string, proposalOptionId: string) => {
    const proposal = proposals.find((p) => p.proposal_options.some((o) => o.option_id === proposalOptionId));
    const pOpt = proposal?.proposal_options.find((o) => o.option_id === proposalOptionId);
    if (!pOpt) return;

    const applyTds = true;
    const adultBreakdown = pOpt.buy_price_adult
      ? calculatePricing(pOpt.buy_price_adult, applyTds)
      : undefined;
    const cwbBreakdown = pOpt.buy_price_child_with_bed
      ? calculatePricing(pOpt.buy_price_child_with_bed, applyTds)
      : undefined;
    const cnbBreakdown = pOpt.buy_price_child_without_bed
      ? calculatePricing(pOpt.buy_price_child_without_bed, applyTds)
      : undefined;

    updateOption(optionId, {
      hotel_name: pOpt.hotel_name,
      hotel_category: pOpt.hotel_category,
      nights: pOpt.nights,
      meal_plan: pOpt.meal_plan,
      transport_type: pOpt.transport_type,
      inclusions: pOpt.inclusions ? pOpt.inclusions.split(',').map((s) => s.trim()) : [],
      exclusions: pOpt.exclusions ? pOpt.exclusions.split(',').map((s) => s.trim()) : [],
      itinerary_summary: pOpt.itinerary_summary,
      proposal_id: proposal?.proposal_id,
      proposal_option_id: proposalOptionId,
      adult_pricing: adultBreakdown ? { buy_price: pOpt.buy_price_adult!, breakdown: adultBreakdown } : undefined,
      child_with_bed_pricing: cwbBreakdown ? { buy_price: pOpt.buy_price_child_with_bed!, breakdown: cwbBreakdown } : undefined,
      child_without_bed_pricing: cnbBreakdown ? { buy_price: pOpt.buy_price_child_without_bed!, breakdown: cnbBreakdown } : undefined,
    });
    toast.success('Proposal option applied');
  };

  if (!quote) return null;

  const currentOption = quote.budget_options[Number(activeTab)] ?? quote.budget_options[0];

  // Group total
  const groupTotal = (() => {
    if (!currentOption) return 0;
    const adult = (currentOption.adult_pricing?.breakdown.final_selling_price ?? 0) * quote.adults_count;
    const cwb = (currentOption.child_with_bed_pricing?.breakdown.final_selling_price ?? 0) * Math.max(0, quote.children_count - 1);
    const cnb = (currentOption.child_without_bed_pricing?.breakdown.final_selling_price ?? 0);
    return adult + cwb + cnb;
  })();

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-heading">Quote Builder</h2>
              <Badge variant="outline" className="text-xs">v{quote.version}</Badge>
              <Badge className={cn('text-xs', quote.status === 'DRAFT' ? 'bg-muted text-muted-foreground' : 'bg-blue-100 text-blue-700')}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{quote.quotation_ref}{lastSaved && ` · Saved ${formatDateTime(lastSaved)}`}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave()} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/quotes/${quote.quotation_id}/preview`)} className="gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button size="sm" onClick={() => setSendDialogOpen(true)} className="gap-1.5">
            <Send className="h-3.5 w-3.5" /> Send to Guest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        {/* LEFT — Form */}
        <div className="space-y-6 min-w-0">
          {/* Section A — Quote Header */}
          <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
            <h3 className="text-sm font-semibold">Quote Details</h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Trip Title</Label>
              <Input value={quote.trip_title} onChange={(e) => update({ trip_title: e.target.value })} className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Guest Name</Label>
                <Input value={quote.guest_name} onChange={(e) => update({ guest_name: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Quote Valid Until</Label>
                <DatePickerButton value={quote.valid_until} onChange={(v) => update({ valid_until: v })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Departure Date</Label>
                <DatePickerButton value={quote.departure_date} onChange={handleDepartureChange} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Return Date</Label>
                <DatePickerButton value={quote.return_date} onChange={handleReturnChange} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Duration (nights)</Label>
                <Input type="number" value={quote.duration_days} readOnly className="h-9 text-sm bg-muted/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Adults</Label>
                <Input type="number" value={quote.adults_count} onChange={(e) => update({ adults_count: Number(e.target.value) })} className="h-9 text-sm" min={1} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Children</Label>
                <Input type="number" value={quote.children_count} onChange={(e) => update({ children_count: Number(e.target.value) })} className="h-9 text-sm" min={0} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Infants</Label>
                <Input type="number" value={quote.infants_count} onChange={(e) => update({ infants_count: Number(e.target.value) })} className="h-9 text-sm" min={0} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Terms</Label>
              <Textarea value={quote.payment_terms || ''} onChange={(e) => update({ payment_terms: e.target.value })} rows={2} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cancellation Policy</Label>
              <Textarea value={quote.cancellation_policy || ''} onChange={(e) => update({ cancellation_policy: e.target.value })} rows={2} className="text-sm" />
            </div>
          </div>

          {/* Section B — Budget Options */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">Budget Options</h3>
              {quote.budget_options.length < 4 && (
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addOption}>
                  <Plus className="h-3 w-3" /> Add Option
                </Button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-5 pt-3 border-b border-border">
                <TabsList className="h-8">
                  {quote.budget_options.map((opt, idx) => (
                    <TabsTrigger key={opt.option_id} value={String(idx)} className="text-xs">
                      {opt.option_name}
                      {opt.is_recommended && <span className="ml-1 text-[9px] text-brand-gold">★</span>}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {quote.budget_options.map((opt, idx) => (
                <TabsContent key={opt.option_id} value={String(idx)} className="p-5 space-y-5 mt-0">
                  {/* Pull from DMC proposal */}
                  {proposals.length > 0 && (
                    <div className="bg-muted/20 rounded-lg p-3 border border-border space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Pull from DMC Proposal</p>
                      <div className="flex gap-2 flex-wrap">
                        {proposals.flatMap((p) =>
                          p.proposal_options.map((po) => (
                            <Button
                              key={po.option_id}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => applyProposalOption(opt.option_id, po.option_id)}
                            >
                              {p.dmc_name.split(' ')[0]} — {po.option_name}
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Hotel Name</Label>
                      <Input value={opt.hotel_name} onChange={(e) => updateOption(opt.option_id, { hotel_name: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Category</Label>
                      <Select value={opt.hotel_category} onValueChange={(v) => updateOption(opt.option_id, { hotel_category: v as typeof opt.hotel_category })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HOTEL_CATS.map((c) => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nights</Label>
                      <Input type="number" value={opt.nights} onChange={(e) => updateOption(opt.option_id, { nights: Number(e.target.value) })} className="h-8 text-sm" min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Meal Plan</Label>
                      <Select value={opt.meal_plan} onValueChange={(v) => updateOption(opt.option_id, { meal_plan: v })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MEAL_PLANS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs">Transport Type</Label>
                      <Input value={opt.transport_type || ''} onChange={(e) => updateOption(opt.option_id, { transport_type: e.target.value })} className="h-8 text-sm" placeholder="e.g. Private Transfers" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Inclusions</Label>
                    <BulletBuilder
                      value={opt.inclusions}
                      onChange={(v) => updateOption(opt.option_id, { inclusions: v })}
                      placeholder="Add inclusion..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Exclusions</Label>
                    <BulletBuilder
                      value={opt.exclusions}
                      onChange={(v) => updateOption(opt.option_id, { exclusions: v })}
                      placeholder="Add exclusion..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Itinerary Summary</Label>
                    <Textarea
                      value={opt.itinerary_summary || ''}
                      onChange={(e) => updateOption(opt.option_id, { itinerary_summary: e.target.value })}
                      rows={4}
                      className="text-sm"
                      placeholder="Day 1: Arrive... Day 2: ..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={opt.is_recommended}
                        onCheckedChange={(v) => updateOption(opt.option_id, { is_recommended: v })}
                      />
                      <Label className="text-xs">Mark as Recommended</Label>
                    </div>
                    {quote.budget_options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => removeOption(opt.option_id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Remove Option
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Section C — Content */}
          <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
            <h3 className="text-sm font-semibold">Message & Terms</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Agent Note to Guest</Label>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground">
                  <Sparkles className="h-3 w-3" /> AI Assist
                </Button>
              </div>
              <Textarea
                value={quote.agent_note || ''}
                onChange={(e) => update({ agent_note: e.target.value })}
                rows={3}
                className="text-sm"
                placeholder="Personalised note to the guest..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Terms & Conditions</Label>
              <Textarea
                value={quote.terms_and_conditions || ''}
                onChange={(e) => update({ terms_and_conditions: e.target.value })}
                rows={5}
                className="text-sm text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Live Preview Panel */}
        <div className="space-y-4">
          <div className="sticky top-4 space-y-4">
            <div className="border border-border rounded-lg bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Pricing — {currentOption?.option_name}</h3>
                {groupTotal > 0 && (
                  <span className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded font-semibold">
                    Group: {fmt(groupTotal)}
                  </span>
                )}
              </div>

              <PricingEnginePanel
                label="Adult (per person)"
                initialBuyPrice={currentOption?.adult_pricing?.buy_price ?? 0}
                initialApplyTds={true}
                onChange={(bd) => updateOption(currentOption?.option_id, {
                  adult_pricing: { buy_price: bd.buy_price, breakdown: bd },
                })}
              />

              {quote.children_count > 0 && (
                <>
                  <PricingEnginePanel
                    label="Child with Bed"
                    initialBuyPrice={currentOption?.child_with_bed_pricing?.buy_price ?? 0}
                    initialApplyTds={true}
                    onChange={(bd) => updateOption(currentOption?.option_id, {
                      child_with_bed_pricing: { buy_price: bd.buy_price, breakdown: bd },
                    })}
                  />
                  <PricingEnginePanel
                    label="Child without Bed"
                    initialBuyPrice={currentOption?.child_without_bed_pricing?.buy_price ?? 0}
                    initialApplyTds={true}
                    onChange={(bd) => updateOption(currentOption?.option_id, {
                      child_without_bed_pricing: { buy_price: bd.buy_price, breakdown: bd },
                    })}
                  />
                </>
              )}

              {quote.infants_count > 0 && (
                <PricingEnginePanel
                  label="Infant"
                  initialBuyPrice={currentOption?.infant_pricing?.buy_price ?? 0}
                  initialApplyTds={false}
                  onChange={(bd) => updateOption(currentOption?.option_id, {
                    infant_pricing: { buy_price: bd.buy_price, breakdown: bd },
                  })}
                />
              )}
            </div>

            {/* Quick summary */}
            <div className="border border-border rounded-lg bg-card p-4 space-y-3 text-sm">
              <h3 className="text-sm font-semibold">Summary</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trip</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{quote.trip_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates</span>
                  <span>{quote.departure_date && format(parseISO(quote.departure_date), 'dd MMM')} – {quote.return_date && format(parseISO(quote.return_date), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{quote.duration_days} nights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pax</span>
                  <span>{quote.adults_count}A {quote.children_count > 0 ? `· ${quote.children_count}C` : ''} {quote.infants_count > 0 ? `· ${quote.infants_count}I` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Options</span>
                  <span>{quote.budget_options.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Valid Until</span>
                  <span>{quote.valid_until && format(parseISO(quote.valid_until), 'dd MMM yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Builder — full width below the main grid */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-5 py-3 bg-muted/30 border-b border-border">
          <h3 className="text-sm font-semibold">Day-by-Day Itinerary</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Drag to reorder. Imported package days can be edited freely.</p>
        </div>
        <div className="p-5">
          <ItineraryBuilder
            days={itineraryDays}
            onAddDay={() => addItineraryDay(quote.quotation_id)}
            onUpdateDay={(dayId, updates) => updateItineraryDay(quote.quotation_id, dayId, updates)}
            onRemoveDay={(dayId) => removeItineraryDay(quote.quotation_id, dayId)}
            onReorder={(activeId, overId) => reorderItineraryDays(quote.quotation_id, activeId, overId)}
            onImportFromPackage={(days) => importFromPackage(quote.quotation_id, days)}
          />
        </div>
      </div>

      <ConfirmDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        title="Send quote to guest?"
        description={`This will mark the enquiry as Quote Sent and increment to v${quote.version + 1}. The guest will receive the quote via email.`}
        confirmLabel="Send Quote"
        onConfirm={handleSendToGuest}
      />
    </div>
  );
}
