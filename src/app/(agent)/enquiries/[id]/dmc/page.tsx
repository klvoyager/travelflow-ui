'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Star, Clock, FileText, CheckCircle2,
  Plus, ChevronDown, ChevronUp, Send, Loader2, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { useEnquiry } from '@/lib/hooks/useEnquiries';
import { useDMCPartners, useDMCForwards, useProposals } from '@/lib/hooks/useDMC';
import { useDMCStore } from '@/store/dmcStore';
import { useEnquiryStore } from '@/store/enquiryStore';
import { useAuth } from '@/lib/hooks/useAuth';
import type { DMCForward, DMCProposalOption, HotelCategory } from '@/lib/types';

const FORWARD_STATUS_COLORS: Record<DMCForward['status'], string> = {
  SENT: 'bg-blue-100 text-blue-700 border-blue-200',
  RESPONDED: 'bg-green-100 text-green-700 border-green-200',
  SELECTED: 'bg-brand-gold/10 text-brand-gold border-brand-gold/30',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const MEAL_PLANS = ['RO', 'BB', 'HB', 'FB', 'AI', 'UAI'];
const HOTEL_CATS: { value: HotelCategory; label: string }[] = [
  { value: '3_STAR', label: '3 Star' },
  { value: '4_STAR', label: '4 Star' },
  { value: '5_STAR', label: '5 Star' },
  { value: 'BOUTIQUE', label: 'Boutique' },
];
const OPTION_NAMES = ['Deluxe', 'Luxury', 'Standard', 'Budget'] as const;

function RatingStars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('h-3 w-3', i <= Math.floor(rating) ? 'fill-brand-gold text-brand-gold' : 'text-muted-foreground')}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

interface ProposalOptionFormState {
  option_name: typeof OPTION_NAMES[number];
  hotel_name: string;
  hotel_category: HotelCategory;
  nights: string;
  meal_plan: string;
  transport_type: string;
  buy_price_adult: string;
  buy_price_child_with_bed: string;
  buy_price_child_without_bed: string;
  buy_price_infant: string;
  buy_currency: string;
  inclusions: string;
  exclusions: string;
  itinerary_summary: string;
}

function emptyOption(name: typeof OPTION_NAMES[number]): ProposalOptionFormState {
  return {
    option_name: name,
    hotel_name: '',
    hotel_category: '4_STAR',
    nights: '',
    meal_plan: 'BB',
    transport_type: '',
    buy_price_adult: '',
    buy_price_child_with_bed: '',
    buy_price_child_without_bed: '',
    buy_price_infant: '',
    buy_currency: 'INR',
    inclusions: '',
    exclusions: '',
    itinerary_summary: '',
  };
}

export default function DMCPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuth();
  const { enquiry } = useEnquiry(id);
  const { partners } = useDMCPartners(enquiry?.destinations.map((d) => d.country));
  const { forwards } = useDMCForwards(id);
  const { proposals } = useProposals(id);
  const { addForward, addProposal, selectDMC } = useDMCStore();
  const { updateStatus } = useEnquiryStore();

  // Section A state
  const [selectedDMCIds, setSelectedDMCIds] = useState<string[]>([]);
  const [destinationPerDMC, setDestinationPerDMC] = useState<Record<string, string>>({});
  const [forwarding, setForwarding] = useState(false);

  // Section C — proposal drawer state
  const [proposalDrawerOpen, setProposalDrawerOpen] = useState(false);
  const [proposalForwardId, setProposalForwardId] = useState<string>('');
  const [proposalDMCName, setProposalDMCName] = useState('');
  const [receivedVia, setReceivedVia] = useState<'MANUAL_ENTRY' | 'PORTAL_UPLOAD'>('MANUAL_ENTRY');
  const [proposalNotes, setProposalNotes] = useState('');
  const [proposalOptions, setProposalOptions] = useState<ProposalOptionFormState[]>([emptyOption('Standard')]);
  const [savingProposal, setSavingProposal] = useState(false);

  const alreadyForwardedIds = forwards.map((f) => f.dmc_id);

  const toggleDMC = (dmcId: string) => {
    setSelectedDMCIds((prev) =>
      prev.includes(dmcId) ? prev.filter((id) => id !== dmcId) : [...prev, dmcId]
    );
  };

  const buildMessage = (dmcId: string) => {
    if (!enquiry) return '';
    const dmc = partners.find((p) => p.dmc_id === dmcId);
    const dest = destinationPerDMC[dmcId] || enquiry.destinations.map((d) => `${d.city}, ${d.country}`).join(' + ');
    return `Dear ${dmc?.contact_person || 'Team'},\n\nWe have a client enquiry and would like to request your best quote for the following:\n\nDestination: ${dest}\nDeparture: ${enquiry.departure_date_preferred}\nDuration: ${enquiry.duration_days} nights\nPax: ${enquiry.adults_count} Adult(s)${enquiry.children_count ? `, ${enquiry.children_count} Child(ren)` : ''}${enquiry.infants_count ? `, ${enquiry.infants_count} Infant(s)` : ''}\nAccommodation: ${enquiry.accommodation_pref?.replace('_', ' ')}\nMeal Plan: ${enquiry.meal_plan_pref}\n\nPlease send your best rates at the earliest.\n\nWarm regards,\n${currentUser.full_name}\nKL Voyager`;
  };

  const handleForward = async () => {
    if (!enquiry || selectedDMCIds.length === 0) return;
    setForwarding(true);
    await new Promise((r) => setTimeout(r, 800));

    selectedDMCIds.forEach((dmcId) => {
      const dmc = partners.find((p) => p.dmc_id === dmcId)!;
      const forward: DMCForward = {
        forward_id: `fwd-${Date.now()}-${dmcId}`,
        enquiry_id: id,
        dmc_id: dmcId,
        dmc_name: dmc.company_name,
        destination: destinationPerDMC[dmcId] || enquiry.destinations.map((d) => d.country).join(', '),
        status: 'SENT',
        message_sent: buildMessage(dmcId),
        forwarded_at: new Date().toISOString(),
      };
      addForward(forward);
    });

    updateStatus(
      id,
      'SOURCING_PARTNERS',
      currentUser.full_name,
      currentUser.user_id,
      `Forwarded to: ${selectedDMCIds.map((dmcId) => partners.find((p) => p.dmc_id === dmcId)?.display_name).join(', ')}`
    );

    setForwarding(false);
    setSelectedDMCIds([]);
    toast.success(`Forwarded to ${selectedDMCIds.length} DMC(s)`);
  };

  const openProposalDrawer = (forward: DMCForward) => {
    setProposalForwardId(forward.forward_id);
    setProposalDMCName(forward.dmc_name);
    setProposalOptions([emptyOption('Standard')]);
    setProposalNotes('');
    setReceivedVia('MANUAL_ENTRY');
    setProposalDrawerOpen(true);
  };

  const updateOption = (idx: number, field: keyof ProposalOptionFormState, value: string) => {
    setProposalOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
  };

  const handleSaveProposal = async () => {
    setSavingProposal(true);
    await new Promise((r) => setTimeout(r, 600));

    const forward = forwards.find((f) => f.forward_id === proposalForwardId);
    if (!forward) return;

    const proposal = {
      proposal_id: `prop-${Date.now()}`,
      forward_id: proposalForwardId,
      enquiry_id: id,
      dmc_id: forward.dmc_id,
      dmc_name: proposalDMCName,
      received_via: receivedVia,
      status: 'RECEIVED' as const,
      notes: proposalNotes,
      proposal_options: proposalOptions.map((o, i) => ({
        option_id: `popt-${Date.now()}-${i}`,
        option_name: o.option_name,
        hotel_name: o.hotel_name,
        hotel_category: o.hotel_category,
        nights: Number(o.nights) || 0,
        meal_plan: o.meal_plan,
        transport_type: o.transport_type || undefined,
        buy_price_adult: o.buy_price_adult ? Number(o.buy_price_adult) : undefined,
        buy_price_child_with_bed: o.buy_price_child_with_bed ? Number(o.buy_price_child_with_bed) : undefined,
        buy_price_child_without_bed: o.buy_price_child_without_bed ? Number(o.buy_price_child_without_bed) : undefined,
        buy_price_infant: o.buy_price_infant ? Number(o.buy_price_infant) : undefined,
        buy_currency: o.buy_currency,
        inclusions: o.inclusions || undefined,
        exclusions: o.exclusions || undefined,
        itinerary_summary: o.itinerary_summary || undefined,
      })),
      received_at: new Date().toISOString(),
    };

    addProposal(proposal);
    setSavingProposal(false);
    setProposalDrawerOpen(false);
    toast.success('Proposal saved successfully');
  };

  const handleSelectDMC = (forward: DMCForward) => {
    selectDMC(id, forward.forward_id);
    updateStatus(id, 'PARTNERS_RESPONDED', currentUser.full_name, currentUser.user_id, `Selected DMC: ${forward.dmc_name}`);
    toast.success(`${forward.dmc_name} selected`);
  };

  if (!enquiry) return null;

  const availableToForward = partners.filter((p) => !alreadyForwardedIds.includes(p.dmc_id));
  const hasUnrespondedForwards = forwards.some((f) => f.status === 'SENT');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-lg font-bold font-heading">DMC Forwarding</h2>
          <p className="text-xs text-muted-foreground">{enquiry.enquiry_ref} — {enquiry.destinations.map((d) => d.country).join(', ')}</p>
        </div>
      </div>

      {/* Section A — Forward to DMC */}
      {availableToForward.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Available DMC Partners</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {availableToForward.map((dmc) => {
              const selected = selectedDMCIds.includes(dmc.dmc_id);
              return (
                <div
                  key={dmc.dmc_id}
                  className={cn(
                    'border rounded-lg p-4 cursor-pointer transition-all',
                    selected ? 'border-brand-gold bg-brand-gold/5' : 'border-border bg-card hover:border-brand-gold/50'
                  )}
                  onClick={() => toggleDMC(dmc.dmc_id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleDMC(dmc.dmc_id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="font-semibold text-sm">{dmc.display_name || dmc.company_name}</p>
                        <p className="text-xs text-muted-foreground">{dmc.contact_person}</p>
                      </div>
                    </div>
                    {dmc.is_inhouse && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] shrink-0">In-House</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {dmc.destinations.map((d) => (
                      <Badge key={`${d.country}-${d.city}`} variant="outline" className="text-[10px] px-1.5 py-0">
                        {d.city}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    {dmc.rating && <RatingStars rating={dmc.rating} />}
                    {dmc.sla_hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {dmc.sla_hours}h SLA
                      </span>
                    )}
                    {dmc.preferred_format && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {dmc.preferred_format}
                      </span>
                    )}
                  </div>

                  {selected && (
                    <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                      <Label className="text-xs">Destination for this DMC</Label>
                      <Input
                        placeholder="e.g. Paris + Zurich"
                        value={destinationPerDMC[dmc.dmc_id] || ''}
                        onChange={(e) =>
                          setDestinationPerDMC((prev) => ({ ...prev, [dmc.dmc_id]: e.target.value }))
                        }
                        className="h-7 text-xs mt-1"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Message preview */}
          {selectedDMCIds.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Message Preview</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {buildMessage(selectedDMCIds[0])}
              </pre>
              {selectedDMCIds.length > 1 && (
                <p className="text-xs text-muted-foreground">+ {selectedDMCIds.length - 1} more DMC(s) will receive tailored messages</p>
              )}
            </div>
          )}

          <Button
            onClick={handleForward}
            disabled={selectedDMCIds.length === 0 || forwarding}
            className="gap-2"
          >
            {forwarding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Forward to {selectedDMCIds.length > 0 ? `${selectedDMCIds.length} ` : ''}Selected DMC{selectedDMCIds.length !== 1 ? 's' : ''}
          </Button>
        </section>
      )}

      {/* Section B — Forward status table */}
      {forwards.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Forwarding Status</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">DMC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Forwarded</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forwards.map((fwd, idx) => {
                  const proposal = proposals.find((p) => p.forward_id === fwd.forward_id);
                  return (
                    <tr key={fwd.forward_id} className={cn('border-b border-border last:border-0', idx % 2 === 1 && 'bg-muted/10')}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{fwd.dmc_name}</p>
                          {fwd.responded_at && (
                            <p className="text-xs text-muted-foreground">Responded {formatDate(fwd.responded_at)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{fwd.destination}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(fwd.forwarded_at)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-[11px] font-medium border rounded px-2 py-0.5', FORWARD_STATUS_COLORS[fwd.status])}>
                          {fwd.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {fwd.status === 'RESPONDED' && !proposal && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openProposalDrawer(fwd)}>
                              <Plus className="h-3 w-3 mr-1" /> Add Proposal
                            </Button>
                          )}
                          {proposal && fwd.status !== 'SELECTED' && (
                            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleSelectDMC(fwd)}>
                              <CheckCircle2 className="h-3 w-3" /> Select this DMC
                            </Button>
                          )}
                          {fwd.status === 'SELECTED' && (
                            <span className="text-xs text-brand-gold font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                            </span>
                          )}
                          {proposal && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> {proposal.proposal_options.length} option(s)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasUnrespondedForwards && (
            <p className="text-xs text-muted-foreground">Waiting for DMC response(s). You can add a proposal manually once received.</p>
          )}
        </section>
      )}

      {forwards.length === 0 && availableToForward.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No DMC partners available for this destination.</p>
        </div>
      )}

      {/* Section C — Proposal drawer */}
      <Sheet open={proposalDrawerOpen} onOpenChange={setProposalDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Proposal — {proposalDMCName}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {/* Received via */}
            <div className="space-y-1.5">
              <Label>Received via</Label>
              <Select value={receivedVia} onValueChange={(v) => setReceivedVia(v as typeof receivedVia)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL_ENTRY">Manual Entry</SelectItem>
                  <SelectItem value="PORTAL_UPLOAD">Portal Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Budget Options</Label>
                {proposalOptions.length < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const usedNames = proposalOptions.map((o) => o.option_name);
                      const next = OPTION_NAMES.find((n) => !usedNames.includes(n));
                      if (next) setProposalOptions((prev) => [...prev, emptyOption(next)]);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Option
                  </Button>
                )}
              </div>

              {proposalOptions.map((opt, idx) => (
                <ProposalOptionForm
                  key={idx}
                  opt={opt}
                  idx={idx}
                  onUpdate={(field, value) => updateOption(idx, field, value)}
                  onRemove={proposalOptions.length > 1 ? () => setProposalOptions((prev) => prev.filter((_, i) => i !== idx)) : undefined}
                />
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any notes from the DMC, special conditions, or observations..."
                value={proposalNotes}
                onChange={(e) => setProposalNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSaveProposal} disabled={savingProposal} className="w-full gap-2">
              {savingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save Proposal
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ProposalOptionForm({
  opt,
  idx,
  onUpdate,
  onRemove,
}: {
  opt: ProposalOptionFormState;
  idx: number;
  onUpdate: (field: keyof ProposalOptionFormState, value: string) => void;
  onRemove?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <Select
            value={opt.option_name}
            onValueChange={(v) => onUpdate('option_name', v)}
          >
            <SelectTrigger className="h-7 w-28 text-xs border-0 bg-transparent shadow-none p-0 focus:ring-0" onClick={(e) => e.stopPropagation()}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPTION_NAMES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          {opt.hotel_name && <span className="text-xs text-muted-foreground">{opt.hotel_name}</span>}
        </div>
        <div className="flex items-center gap-2">
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
            >
              Remove
            </Button>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Hotel Name</Label>
              <Input value={opt.hotel_name} onChange={(e) => onUpdate('hotel_name', e.target.value)} className="h-8 text-sm" placeholder="Hotel name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={opt.hotel_category} onValueChange={(v) => onUpdate('hotel_category', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOTEL_CATS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nights</Label>
              <Input type="number" value={opt.nights} onChange={(e) => onUpdate('nights', e.target.value)} className="h-8 text-sm" placeholder="0" min={0} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Meal Plan</Label>
              <Select value={opt.meal_plan} onValueChange={(v) => onUpdate('meal_plan', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEAL_PLANS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Transport Type</Label>
              <Input value={opt.transport_type} onChange={(e) => onUpdate('transport_type', e.target.value)} className="h-8 text-sm" placeholder="e.g. Private Transfers, SIC Coach" />
            </div>
          </div>

          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buy Prices (per person)</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['buy_price_adult', 'Adult'],
              ['buy_price_child_with_bed', 'Child (with bed)'],
              ['buy_price_child_without_bed', 'Child (no bed)'],
              ['buy_price_infant', 'Infant'],
            ] as [keyof ProposalOptionFormState, string][]).map(([field, label]) => (
              <div key={field} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <div className="flex items-center gap-1">
                  <Select value={opt.buy_currency} onValueChange={(v) => onUpdate('buy_currency', v)}>
                    <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['INR', 'USD', 'EUR', 'AED', 'THB', 'SGD'].map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={opt[field] as string}
                    onChange={(e) => onUpdate(field, e.target.value)}
                    className="h-8 text-sm flex-1"
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Inclusions</Label>
              <Textarea value={opt.inclusions} onChange={(e) => onUpdate('inclusions', e.target.value)} rows={2} placeholder="Hotel (5 nights), Daily breakfast, Airport transfers..." className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Exclusions</Label>
              <Textarea value={opt.exclusions} onChange={(e) => onUpdate('exclusions', e.target.value)} rows={2} placeholder="Flights, Visa, Meals not mentioned..." className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Itinerary Summary</Label>
              <Textarea value={opt.itinerary_summary} onChange={(e) => onUpdate('itinerary_summary', e.target.value)} rows={3} placeholder="Day 1: Arrive... Day 2:..." className="text-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
