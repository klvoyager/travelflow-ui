'use client';

import { useMemo } from 'react';
import { useDMCStore } from '@/store/dmcStore';
import { mockDMCPartners } from '@/lib/mock';
import type { DMCPartner, DMCForward, DMCProposal } from '@/lib/types';

export function useDMCPartners(destinationCountries?: string[]): {
  partners: DMCPartner[];
  isLoading: false;
} {
  const partners = useMemo(() => {
    if (!destinationCountries || destinationCountries.length === 0) {
      return mockDMCPartners.filter((d) => d.is_active);
    }
    return mockDMCPartners.filter(
      (d) =>
        d.is_active &&
        d.countries.some((c) =>
          destinationCountries.some(
            (dc) => dc.toLowerCase() === c.toLowerCase()
          )
        )
    );
  }, [destinationCountries]);

  return { partners, isLoading: false };
}

export function useDMCForwards(enquiryId: string): {
  forwards: DMCForward[];
  isLoading: false;
} {
  const allForwards = useDMCStore((s) => s.forwards);
  const forwards = useMemo(
    () => allForwards.filter((f) => f.enquiry_id === enquiryId),
    [allForwards, enquiryId]
  );
  return { forwards, isLoading: false };
}

export function useProposals(enquiryId: string): {
  proposals: DMCProposal[];
  isLoading: false;
} {
  const allProposals = useDMCStore((s) => s.proposals);
  const proposals = useMemo(
    () => allProposals.filter((p) => p.enquiry_id === enquiryId),
    [allProposals, enquiryId]
  );
  return { proposals, isLoading: false };
}
