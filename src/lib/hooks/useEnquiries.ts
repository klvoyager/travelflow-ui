'use client';

import { useState, useEffect, useMemo } from 'react';
import { mockEnquiries } from '@/lib/mock';
import type { Enquiry, EnquiryStatus, Priority } from '@/lib/types';
import { useEnquiryStore } from '@/store/enquiryStore';

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export interface EnquiryFilters {
  status?: EnquiryStatus[];
  priority?: Priority[];
  assignedAgent?: string;
  destination?: string;
  slaBreached?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export function useEnquiries(filters?: EnquiryFilters, pagination?: PaginationState) {
  const { enquiries: storeEnquiries } = useEnquiryStore();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate 300ms network delay on first load only
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const baseList = MOCK_MODE ? storeEnquiries : [];

  const filtered = useMemo(() => {
    let list = [...baseList];

    if (filters?.status?.length) {
      list = list.filter(e => filters.status!.includes(e.enquiry_status));
    }
    if (filters?.priority?.length) {
      list = list.filter(e => filters.priority!.includes(e.priority));
    }
    if (filters?.assignedAgent) {
      list = list.filter(e => e.assigned_agent_id === filters.assignedAgent);
    }
    if (filters?.slaBreached) {
      list = list.filter(e => e.sla_breached);
    }
    if (filters?.destination) {
      const q = filters.destination.toLowerCase();
      list = list.filter(e =>
        e.destinations.some(d =>
          d.country.toLowerCase().includes(q) || d.city.toLowerCase().includes(q)
        )
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(e =>
        e.enquiry_ref.toLowerCase().includes(q) ||
        e.customer_name.toLowerCase().includes(q) ||
        e.destinations.some(d =>
          d.country.toLowerCase().includes(q) || d.city.toLowerCase().includes(q)
        )
      );
    }
    if (filters?.dateFrom) {
      list = list.filter(e => e.created_at >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      list = list.filter(e => e.created_at <= filters.dateTo!);
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [baseList, filters]);

  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    enquiries: paginated,
    allEnquiries: filtered,
    isLoading,
    error: null,
    totalCount,
    totalPages,
    page,
    pageSize,
  };
}

export function useEnquiry(id: string) {
  const { enquiries } = useEnquiryStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const enquiry = MOCK_MODE
    ? (enquiries.find(e => e.enquiry_id === id) ?? null)
    : null;

  return { enquiry, isLoading, error: null };
}

export function useEnquiryStats() {
  const { enquiries } = useEnquiryStore();
  const list = MOCK_MODE ? enquiries : [];
  const open = list.filter(e =>
    !['BOOKING_CONFIRMED', 'ENQUIRY_CLOSED'].includes(e.enquiry_status)
  ).length;
  const slaBreached = list.filter(e => e.sla_breached).length;
  return { open, slaBreached };
}
