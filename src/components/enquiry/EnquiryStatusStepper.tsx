'use client';

import { Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENQUIRY_STAGES, getStageConfig } from '@/lib/constants/enquiryStages';
import type { EnquiryStatus } from '@/lib/types';

const MAIN_FLOW: EnquiryStatus[] = [
  'ENQUIRY_RECEIVED',
  'UNDER_REVIEW',
  'SOURCING_PARTNERS',
  'PARTNERS_RESPONDED',
  'PREPARING_QUOTE',
  'QUOTE_SENT',
  'REVISION_REQUESTED',
  'ADVANCE_PAID',
  'BOOKING_CONFIRMED',
];

function getStepState(
  stepStatus: EnquiryStatus,
  currentStatus: EnquiryStatus
): 'completed' | 'current' | 'upcoming' {
  const currentIdx = MAIN_FLOW.indexOf(currentStatus);
  const stepIdx = MAIN_FLOW.indexOf(stepStatus);
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'upcoming';
}

interface EnquiryStatusStepperProps {
  currentStatus: EnquiryStatus;
  className?: string;
}

export function EnquiryStatusStepper({ currentStatus, className }: EnquiryStatusStepperProps) {
  const isClosed = currentStatus === 'ENQUIRY_CLOSED';

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main flow — horizontal on desktop, vertical on mobile */}
      <div className="hidden md:flex items-center gap-0">
        {MAIN_FLOW.map((status, idx) => {
          const config = getStageConfig(status);
          const state = getStepState(status, isClosed ? 'ENQUIRY_RECEIVED' : currentStatus);
          const isCurrent = status === currentStatus && !isClosed;

          return (
            <div key={status} className="flex items-center flex-1 min-w-0">
              {/* Step node */}
              <div className="flex flex-col items-center flex-shrink-0 group relative" title={config.description}>
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all',
                    state === 'completed' && 'bg-brand-gold border-brand-gold text-white',
                    state === 'current' && 'border-brand-gold bg-brand-gold/10 text-brand-gold',
                    state === 'upcoming' && 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {state === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-brand-gold opacity-20" />
                  )}
                </div>
                <p
                  className={cn(
                    'mt-1 text-center text-[10px] leading-tight max-w-[72px]',
                    state === 'current' ? 'text-brand-gold font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {config.label}
                </p>
              </div>

              {/* Connector line (not after last) */}
              {idx < MAIN_FLOW.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 mt-[-1.25rem]',
                    state === 'completed' ? 'bg-brand-gold' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile — vertical compact list */}
      <div className="md:hidden space-y-2">
        {MAIN_FLOW.map((status, idx) => {
          const config = getStageConfig(status);
          const state = getStepState(status, isClosed ? 'ENQUIRY_RECEIVED' : currentStatus);
          const isCurrent = status === currentStatus && !isClosed;

          return (
            <div key={status} className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs font-bold',
                    state === 'completed' && 'bg-brand-gold border-brand-gold text-white',
                    state === 'current' && 'border-brand-gold bg-brand-gold/10 text-brand-gold',
                    state === 'upcoming' && 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {state === 'completed' ? <Check className="h-3 w-3" /> : idx + 1}
                </div>
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-brand-gold opacity-20" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm',
                  state === 'current' ? 'text-brand-gold font-semibold' : 'text-muted-foreground'
                )}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Closed branch */}
      {isClosed && (
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 text-sm border border-border">
          <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
          <span>Enquiry closed — no further actions</span>
        </div>
      )}
    </div>
  );
}
