import type { EnquiryStatus } from '@/lib/types';

export interface EnquiryStageConfig {
  code: EnquiryStatus;
  label: string;
  description: string;
  icon: string;
  color: string;
  colorClass: string;
  bgClass: string;
}

export const ENQUIRY_STAGES: EnquiryStageConfig[] = [
  {
    code: 'ENQUIRY_RECEIVED',
    label: 'Enquiry Received',
    description: 'Guest submitted enquiry — auto-assigned',
    icon: 'Inbox',
    color: '#3B82F6',
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    code: 'UNDER_REVIEW',
    label: 'Under Review',
    description: 'Agent picked up — SLA timer started',
    icon: 'Eye',
    color: '#EAB308',
    colorClass: 'text-yellow-500',
    bgClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  {
    code: 'SOURCING_PARTNERS',
    label: 'Sourcing Partners',
    description: 'Forwarded to DMC(s) — awaiting proposals',
    icon: 'Send',
    color: '#F97316',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    code: 'PARTNERS_RESPONDED',
    label: 'Partners Responded',
    description: 'DMC proposal received — agent reviewing',
    icon: 'MailCheck',
    color: '#A855F7',
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    code: 'PREPARING_QUOTE',
    label: 'Preparing Quote',
    description: 'Agent building quotation',
    icon: 'FileText',
    color: '#6366F1',
    colorClass: 'text-indigo-500',
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    code: 'QUOTE_SENT',
    label: 'Quote Sent',
    description: 'Branded PDF dispatched to guest',
    icon: 'SendHorizontal',
    color: '#06B6D4',
    colorClass: 'text-cyan-500',
    bgClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    code: 'REVISION_REQUESTED',
    label: 'Revision Requested',
    description: 'Changes needed — new version in progress',
    icon: 'RefreshCw',
    color: '#F59E0B',
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    code: 'ADVANCE_PAID',
    label: 'Advance Paid',
    description: 'Payment received — trip record created',
    icon: 'CreditCard',
    color: '#22C55E',
    colorClass: 'text-green-500',
    bgClass: 'bg-green-50 text-green-700 border-green-200',
  },
  {
    code: 'BOOKING_CONFIRMED',
    label: 'Booking Confirmed',
    description: 'Trip underway — full payment tracked',
    icon: 'CheckCircle',
    color: '#10B981',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    code: 'ENQUIRY_CLOSED',
    label: 'Enquiry Closed',
    description: 'Terminal — customer rejected or expired',
    icon: 'XCircle',
    color: '#6B7280',
    colorClass: 'text-gray-500',
    bgClass: 'bg-gray-50 text-gray-600 border-gray-200',
  },
];

export function getStageConfig(code: EnquiryStatus): EnquiryStageConfig {
  return ENQUIRY_STAGES.find(s => s.code === code) ?? ENQUIRY_STAGES[0];
}
