import type { EnquiryStatus } from '@/lib/types';

export interface ActivityEntry {
  activity_id: string;
  enquiry_id: string;
  from_status?: EnquiryStatus;
  to_status: EnquiryStatus;
  changed_by: string;
  changed_by_id: string;
  is_system: boolean;
  reason?: string;
  timestamp: string;
}

export const mockActivityHistory: ActivityEntry[] = [
  // enq-001 history
  {
    activity_id: 'act-001',
    enquiry_id: 'enq-001',
    to_status: 'ENQUIRY_RECEIVED',
    changed_by: 'System',
    changed_by_id: 'system',
    is_system: true,
    reason: 'Enquiry submitted via WhatsApp',
    timestamp: '2026-05-24T08:30:00Z',
  },
  {
    activity_id: 'act-002',
    enquiry_id: 'enq-001',
    from_status: 'ENQUIRY_RECEIVED',
    to_status: 'UNDER_REVIEW',
    changed_by: 'Rahul Menon',
    changed_by_id: 'user-001',
    is_system: false,
    reason: 'Picked up for review',
    timestamp: '2026-05-24T09:00:00Z',
  },
  // enq-002 history
  {
    activity_id: 'act-003',
    enquiry_id: 'enq-002',
    to_status: 'ENQUIRY_RECEIVED',
    changed_by: 'System',
    changed_by_id: 'system',
    is_system: true,
    reason: 'Enquiry submitted via web portal',
    timestamp: '2026-05-21T14:00:00Z',
  },
  {
    activity_id: 'act-004',
    enquiry_id: 'enq-002',
    from_status: 'ENQUIRY_RECEIVED',
    to_status: 'UNDER_REVIEW',
    changed_by: 'Rahul Menon',
    changed_by_id: 'user-001',
    is_system: false,
    timestamp: '2026-05-21T15:30:00Z',
  },
  {
    activity_id: 'act-005',
    enquiry_id: 'enq-002',
    from_status: 'UNDER_REVIEW',
    to_status: 'SOURCING_PARTNERS',
    changed_by: 'Rahul Menon',
    changed_by_id: 'user-001',
    is_system: false,
    reason: 'Forwarded to Europe Voyages SARL',
    timestamp: '2026-05-22T11:30:00Z',
  },
  // enq-003 history
  {
    activity_id: 'act-006',
    enquiry_id: 'enq-003',
    to_status: 'ENQUIRY_RECEIVED',
    changed_by: 'System',
    changed_by_id: 'system',
    is_system: true,
    timestamp: '2026-05-14T09:00:00Z',
  },
  {
    activity_id: 'act-007',
    enquiry_id: 'enq-003',
    from_status: 'ENQUIRY_RECEIVED',
    to_status: 'UNDER_REVIEW',
    changed_by: 'Sneha Pillai',
    changed_by_id: 'user-002',
    is_system: false,
    timestamp: '2026-05-14T10:00:00Z',
  },
  {
    activity_id: 'act-008',
    enquiry_id: 'enq-003',
    from_status: 'UNDER_REVIEW',
    to_status: 'SOURCING_PARTNERS',
    changed_by: 'Sneha Pillai',
    changed_by_id: 'user-002',
    is_system: false,
    timestamp: '2026-05-15T09:00:00Z',
  },
  {
    activity_id: 'act-009',
    enquiry_id: 'enq-003',
    from_status: 'SOURCING_PARTNERS',
    to_status: 'PARTNERS_RESPONDED',
    changed_by: 'System',
    changed_by_id: 'system',
    is_system: true,
    reason: 'DMC proposal received',
    timestamp: '2026-05-17T14:00:00Z',
  },
  {
    activity_id: 'act-010',
    enquiry_id: 'enq-003',
    from_status: 'PARTNERS_RESPONDED',
    to_status: 'PREPARING_QUOTE',
    changed_by: 'Sneha Pillai',
    changed_by_id: 'user-002',
    is_system: false,
    timestamp: '2026-05-18T09:00:00Z',
  },
  {
    activity_id: 'act-011',
    enquiry_id: 'enq-003',
    from_status: 'PREPARING_QUOTE',
    to_status: 'QUOTE_SENT',
    changed_by: 'Sneha Pillai',
    changed_by_id: 'user-002',
    is_system: false,
    reason: 'Quote emailed to Anjali Reddy',
    timestamp: '2026-05-20T16:00:00Z',
  },
];
