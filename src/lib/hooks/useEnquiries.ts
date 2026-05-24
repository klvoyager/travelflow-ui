'use client';

import { mockEnquiries } from '@/lib/mock';
import type { Enquiry, EnquiryStatus, Priority } from '@/lib/types';

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export function useEnquiries() {
  if (MOCK_MODE) {
    return {
      enquiries: mockEnquiries,
      isLoading: false,
      error: null,
    };
  }
  // Real API hook would go here
  return { enquiries: [], isLoading: false, error: null };
}

export function useEnquiry(id: string) {
  if (MOCK_MODE) {
    const enquiry = mockEnquiries.find(e => e.enquiry_id === id) ?? null;
    return { enquiry, isLoading: false, error: null };
  }
  return { enquiry: null, isLoading: false, error: null };
}

export function useEnquiryStats() {
  const enquiries = MOCK_MODE ? mockEnquiries : [];
  const open = enquiries.filter(e =>
    !['BOOKING_CONFIRMED', 'ENQUIRY_CLOSED'].includes(e.enquiry_status)
  ).length;
  const slaBreached = enquiries.filter(e => e.sla_breached).length;
  return { open, slaBreached };
}
