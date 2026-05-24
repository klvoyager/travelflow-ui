'use client';

import { mockTrips } from '@/lib/mock';
import { daysUntil } from '@/lib/utils';
import type { HotnessFlag } from '@/lib/types';

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export function useTrips() {
  if (MOCK_MODE) {
    return {
      trips: mockTrips,
      isLoading: false,
      error: null,
    };
  }
  return { trips: [], isLoading: false, error: null };
}

export function useTrip(id: string) {
  if (MOCK_MODE) {
    const trip = mockTrips.find(t => t.trip_id === id) ?? null;
    return { trip, isLoading: false, error: null };
  }
  return { trip: null, isLoading: false, error: null };
}

export function useTripStats() {
  const trips = MOCK_MODE ? mockTrips : [];
  const active = trips.filter(t => t.trip_status === 'IN_PROGRESS').length;
  const departingThisWeek = trips.filter(t => {
    const days = daysUntil(t.departure_date);
    return days >= 0 && days <= 7;
  }).length;
  const hotTrips = trips.filter(t =>
    ['HIGH', 'CRITICAL'].includes(t.hotness_flag) &&
    !['COMPLETED', 'CANCELLED'].includes(t.trip_status)
  );
  return { active, departingThisWeek, hotTrips };
}
