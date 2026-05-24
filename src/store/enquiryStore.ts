'use client';

import { create } from 'zustand';
import { mockEnquiries } from '@/lib/mock';
import { mockActivityHistory, type ActivityEntry } from '@/lib/mock/activityHistory';
import type { Enquiry, EnquiryStatus } from '@/lib/types';

interface EnquiryState {
  enquiries: Enquiry[];
  activityHistory: ActivityEntry[];
  notes: Record<string, { text: string; saved_at: string }[]>;

  updateStatus: (enquiryId: string, newStatus: EnquiryStatus, agentName: string, agentId: string, reason?: string) => void;
  saveNote: (enquiryId: string, text: string) => void;
}

export const useEnquiryStore = create<EnquiryState>()((set, get) => ({
  enquiries: mockEnquiries,
  activityHistory: mockActivityHistory,
  notes: {},

  updateStatus: (enquiryId, newStatus, agentName, agentId, reason) => {
    const enquiries = get().enquiries;
    const current = enquiries.find(e => e.enquiry_id === enquiryId);
    if (!current) return;

    const newActivity: ActivityEntry = {
      activity_id: `act-${Date.now()}`,
      enquiry_id: enquiryId,
      from_status: current.enquiry_status,
      to_status: newStatus,
      changed_by: agentName,
      changed_by_id: agentId,
      is_system: false,
      reason,
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      enquiries: state.enquiries.map(e =>
        e.enquiry_id === enquiryId
          ? { ...e, enquiry_status: newStatus, updated_at: new Date().toISOString() }
          : e
      ),
      activityHistory: [...state.activityHistory, newActivity],
    }));
  },

  saveNote: (enquiryId, text) => {
    set(state => ({
      notes: {
        ...state.notes,
        [enquiryId]: [
          ...(state.notes[enquiryId] ?? []),
          { text, saved_at: new Date().toISOString() },
        ],
      },
    }));
  },
}));
