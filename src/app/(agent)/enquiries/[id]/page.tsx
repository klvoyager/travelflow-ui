'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, User, MapPin, Users, Wallet, Clock,
  Bot, FileText, Download, Save, AlertTriangle,
  Building2, ChevronRight, PenLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { EnquiryStatusStepper } from '@/components/enquiry/EnquiryStatusStepper';
import { EnquiryStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useEnquiry } from '@/lib/hooks/useEnquiries';
import { useEnquiryStore } from '@/store/enquiryStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDate, formatDateTime, formatRelative, formatCurrency } from '@/lib/utils';
import { getStageConfig } from '@/lib/constants/enquiryStages';
import type { EnquiryStatus } from '@/lib/types';
import { toast } from 'sonner';

// ── Action config per status ──────────────────────────────────────────────────
interface ActionConfig {
  label: string;
  nextStatus?: EnquiryStatus;
  variant?: 'default' | 'outline' | 'destructive';
  href?: string;
}

function getActions(enquiryId: string): Partial<Record<EnquiryStatus, ActionConfig[]>> {
  return {
    ENQUIRY_RECEIVED:   [{ label: 'Pick Up Enquiry',           nextStatus: 'UNDER_REVIEW',       variant: 'default' }],
    UNDER_REVIEW:       [{ label: 'Forward to DMC →',          href: `/enquiries/${enquiryId}/dmc`,   variant: 'default' },
                         { label: 'Skip DMC — Build Quote →',  href: `/enquiries/${enquiryId}/quote`, variant: 'outline' }],
    SOURCING_PARTNERS:  [{ label: 'Mark Partners Responded',   nextStatus: 'PARTNERS_RESPONDED', variant: 'default' },
                         { label: 'DMC Proposals →',           href: `/enquiries/${enquiryId}/dmc`,   variant: 'outline' }],
    PARTNERS_RESPONDED: [{ label: 'Build Quote →',             href: `/enquiries/${enquiryId}/quote`, variant: 'default' }],
    PREPARING_QUOTE:    [{ label: 'Open Quote Builder →',      href: `/enquiries/${enquiryId}/quote`, variant: 'default' }],
    QUOTE_SENT:         [{ label: 'Mark Advance Paid',         nextStatus: 'ADVANCE_PAID',       variant: 'default' },
                         { label: 'Request Revision',          nextStatus: 'REVISION_REQUESTED', variant: 'outline' },
                         { label: 'Close Enquiry',             nextStatus: 'ENQUIRY_CLOSED',     variant: 'destructive' }],
    REVISION_REQUESTED: [{ label: 'Revise Quote →',            href: `/enquiries/${enquiryId}/quote`, variant: 'default' }],
    ADVANCE_PAID:       [{ label: 'View Quote →',               href: `/enquiries/${enquiryId}/quote`, variant: 'default' },
                         { label: 'View Trip →',               href: '/trips',                   variant: 'outline' }],
    BOOKING_CONFIRMED:  [{ label: 'View Quote →',               href: `/enquiries/${enquiryId}/quote`, variant: 'outline' },
                         { label: 'View Trip →',               href: '/trips',                   variant: 'default' }],
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  );
}

function SLATimer({ label, due, breached }: { label: string; due?: string; breached: boolean }) {
  if (!due) return null;
  return (
    <div className={`flex items-center justify-between text-xs py-1 ${breached ? 'text-red-600' : 'text-muted-foreground'}`}>
      <span className="flex items-center gap-1">
        {breached && <AlertTriangle className="h-3 w-3" />}
        {label}
      </span>
      <span className={breached ? 'font-bold' : ''}>{formatRelative(due)}</span>
    </div>
  );
}

function LeadScoreGauge({ score }: { score?: number }) {
  if (!score) return null;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Lead Score</span>
        <span className="font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuth();
  const { enquiry, isLoading } = useEnquiry(id);
  const { activityHistory, notes, updateStatus, saveNote } = useEnquiryStore();
  const [noteText, setNoteText] = useState('');
  const [pendingAction, setPendingAction] = useState<ActionConfig | null>(null);

  const enquiryNotes = notes[id] ?? [];
  const enquiryHistory = activityHistory.filter(a => a.enquiry_id === id);

  const handleAction = (action: ActionConfig) => {
    if (action.href) { router.push(action.href); return; }
    setPendingAction(action);
  };

  const confirmAction = () => {
    if (!pendingAction?.nextStatus || !enquiry) return;
    updateStatus(enquiry.enquiry_id, pendingAction.nextStatus, currentUser.full_name, currentUser.user_id);
    toast.success(`Status updated to: ${getStageConfig(pendingAction.nextStatus).label}`);
    setPendingAction(null);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    saveNote(id, noteText.trim());
    setNoteText('');
    toast.success('Note saved');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">Enquiry not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const actions = getActions(id)[enquiry.enquiry_status] ?? [];

  return (
    <>
      <ConfirmDialog
        open={!!pendingAction}
        onOpenChange={open => !open && setPendingAction(null)}
        title={`Confirm: ${pendingAction?.label}`}
        description={
          pendingAction?.nextStatus
            ? `Move enquiry to "${getStageConfig(pendingAction.nextStatus).label}"?`
            : undefined
        }
        onConfirm={confirmAction}
        destructive={pendingAction?.variant === 'destructive'}
      />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold font-heading text-foreground font-mono">
                {enquiry.enquiry_ref}
              </h1>
              <EnquiryStatusBadge status={enquiry.enquiry_status} />
              <PriorityBadge priority={enquiry.priority} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {enquiry.customer_name} · {enquiry.destinations.map(d => `${d.city}, ${d.country}`).join(' & ')}
            </p>
          </div>
        </div>

        {/* Status stepper */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <EnquiryStatusStepper currentStatus={enquiry.enquiry_status} />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="h-9">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              Notes {enquiryNotes.length > 0 && `(${enquiryNotes.length})`}
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
          </TabsList>

          {/* Tab 1 — Overview */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: detail cards */}
              <div className="lg:col-span-2 space-y-4">
                {/* Guest */}
                <Card className="shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" /> Guest Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <InfoRow label="Name"        value={enquiry.customer_name} />
                    <InfoRow label="Email"       value={<a href={`mailto:${enquiry.customer_email}`} className="text-brand-gold hover:underline">{enquiry.customer_email}</a>} />
                    <InfoRow label="Mobile"      value={enquiry.customer_mobile} />
                    <InfoRow label="Nationality" value={enquiry.customer_nationality} />
                  </CardContent>
                </Card>

                {/* Trip requirements */}
                <Card className="shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> Trip Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <InfoRow
                      label="Destinations"
                      value={
                        <div className="flex flex-wrap gap-1 justify-end">
                          {enquiry.destinations.map((d, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{d.city}, {d.country}</Badge>
                          ))}
                        </div>
                      }
                    />
                    <InfoRow label="Departure"   value={formatDate(enquiry.departure_date_preferred)} />
                    {enquiry.return_date_preferred && (
                      <InfoRow label="Return"    value={formatDate(enquiry.return_date_preferred)} />
                    )}
                    <InfoRow label="Duration"    value={enquiry.duration_days ? `${enquiry.duration_days} nights` : undefined} />
                    <InfoRow label="Type"        value={enquiry.enquiry_type.replace(/_/g, ' ')} />
                    <InfoRow label="Purpose"     value={enquiry.travel_purpose} />
                    <InfoRow label="Flexible"    value={enquiry.departure_flexible ? 'Yes' : 'No'} />
                  </CardContent>
                </Card>

                {/* Pax */}
                <Card className="shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" /> Passengers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <InfoRow label="Adults"    value={enquiry.adults_count} />
                    <InfoRow label="Children"  value={
                      enquiry.children_count > 0
                        ? `${enquiry.children_count}${enquiry.children_ages?.length ? ` (ages: ${enquiry.children_ages.join(', ')})` : ''}`
                        : '0'
                    } />
                    <InfoRow label="Infants"   value={enquiry.infants_count} />
                    <InfoRow label="Total Pax" value={enquiry.adults_count + enquiry.children_count + enquiry.infants_count} />
                  </CardContent>
                </Card>

                {/* Budget & Preferences */}
                <Card className="shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" /> Budget & Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <InfoRow label="Budget"         value={enquiry.budget_total ? formatCurrency(enquiry.budget_total, enquiry.budget_currency) : undefined} />
                    <InfoRow label="Accommodation"  value={enquiry.accommodation_pref?.replace('_', ' ')} />
                    <InfoRow label="Meal Plan"      value={enquiry.meal_plan_pref} />
                    {enquiry.special_requests && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Special Requests</p>
                        <p className="text-sm text-foreground bg-muted/30 rounded-md p-2">{enquiry.special_requests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="space-y-4">
                <Card className="shadow-card">
                  <CardContent className="p-4 space-y-4">
                    <LeadScoreGauge score={enquiry.lead_score} />
                    <Separator />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> SLA Timers
                      </p>
                      <SLATimer label="Review due"  due={enquiry.sla_review_due} breached={enquiry.sla_breached} />
                      <SLATimer label="Quote due"   due={enquiry.sla_quote_due}  breached={enquiry.sla_breached} />
                    </div>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground">Assigned Agent</p>
                      <p className="font-medium">{enquiry.assigned_agent_name ?? 'Unassigned'}</p>
                      {enquiry.assignment_group && (
                        <p className="text-xs text-muted-foreground">{enquiry.assignment_group}</p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span>Created</span><span>{formatDate(enquiry.created_at)}</span></div>
                      <div className="flex justify-between"><span>Updated</span><span>{formatRelative(enquiry.updated_at)}</span></div>
                      <div className="flex justify-between"><span>Source</span><span>{enquiry.source_channel}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick links */}
                {['UNDER_REVIEW','SOURCING_PARTNERS','PARTNERS_RESPONDED','PREPARING_QUOTE','QUOTE_SENT','REVISION_REQUESTED','ADVANCE_PAID','BOOKING_CONFIRMED'].includes(enquiry.enquiry_status) && (
                  <Card className="shadow-card">
                    <CardContent className="p-3 space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Links</p>
                      <button
                        onClick={() => router.push(`/enquiries/${id}/dmc`)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-foreground">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> DMC Forwarding
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => router.push(`/enquiries/${id}/quote`)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-foreground">
                          <PenLine className="h-3.5 w-3.5 text-muted-foreground" /> Quote Builder
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Action bar */}
            {actions.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3 p-4 bg-card border border-border rounded-lg shadow-card">
                <span className="text-sm font-medium text-muted-foreground self-center">Actions:</span>
                {actions.map((action, i) => (
                  <Button
                    key={i}
                    variant={action.variant === 'destructive' ? 'destructive' : action.variant === 'outline' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleAction(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2 — Activity */}
          <TabsContent value="activity" className="mt-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                {enquiryHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity recorded.</p>
                ) : (
                  <div className="relative space-y-0">
                    {[...enquiryHistory].reverse().map((entry, idx) => (
                      <div key={entry.activity_id} className="flex gap-3 pb-5 last:pb-0 relative">
                        {idx < enquiryHistory.length - 1 && (
                          <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />
                        )}
                        <div className="shrink-0 mt-0.5 h-7 w-7 rounded-full border-2 border-border bg-card flex items-center justify-center">
                          {entry.is_system
                            ? <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                            : <User className="h-3.5 w-3.5 text-muted-foreground" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.from_status && (
                              <>
                                <EnquiryStatusBadge status={entry.from_status} />
                                <span className="text-muted-foreground text-xs">→</span>
                              </>
                            )}
                            <EnquiryStatusBadge status={entry.to_status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">{entry.changed_by}</span>
                            {' · '}{formatDateTime(entry.timestamp)}
                          </p>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">"{entry.reason}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3 — Internal Notes */}
          <TabsContent value="notes" className="mt-4">
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add an internal note (not visible to the guest)…"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                  <Button size="sm" onClick={handleSaveNote} disabled={!noteText.trim()} className="gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save Note
                  </Button>
                </div>
                <Separator />
                {enquiryNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
                ) : (
                  <div className="space-y-3">
                    {[...enquiryNotes].reverse().map((note, i) => (
                      <div key={i} className="bg-muted/30 rounded-md p-3 text-sm">
                        <p className="text-foreground">{note.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(note.saved_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4 — Documents */}
          <TabsContent value="documents" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Enquiry Confirmation', status: 'generated' },
                { label: 'Quote PDF',             status: enquiry.enquiry_status === 'QUOTE_SENT' || enquiry.enquiry_status === 'ADVANCE_PAID' ? 'generated' : 'pending' },
                { label: 'Advance Receipt',       status: enquiry.enquiry_status === 'ADVANCE_PAID' ? 'generated' : 'pending' },
              ].map(doc => (
                <Card key={doc.label} className="shadow-card">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{doc.label}</p>
                        <Badge
                          variant="outline"
                          className={doc.status === 'generated'
                            ? 'text-[10px] bg-green-50 text-green-700 border-green-200 mt-1'
                            : 'text-[10px] bg-muted text-muted-foreground border-border mt-1'}
                        >
                          {doc.status === 'generated' ? 'Generated' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={doc.status === 'pending'}
                      className="gap-1.5 text-xs"
                    >
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
