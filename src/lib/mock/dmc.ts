import type { DMCPartner } from '@/lib/types';

export const mockDMCPartners: DMCPartner[] = [
  {
    dmc_id: 'dmc-001',
    tenant_id: 'tenant-klvoy',
    company_name: 'Maldives Dream DMC',
    contact_person: 'Ahmed Hassan',
    email: 'ahmed@maldivesdream.mv',
    mobile: '+9607801234',
    countries: ['Maldives'],
    destinations: [
      { country: 'Maldives', city: 'Male' },
      { country: 'Maldives', city: 'Ari Atoll' },
      { country: 'Maldives', city: 'Baa Atoll' },
    ],
    specializations: ['LUXURY_RESORTS', 'HONEYMOON', 'OVERWATER_VILLAS'],
    is_active: true,
    notes: 'Preferred partner for Maldives. Fast response — usually within 4 hours.',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    dmc_id: 'dmc-002',
    tenant_id: 'tenant-klvoy',
    company_name: 'Europe Voyages SARL',
    contact_person: 'Marie Dupont',
    email: 'marie@europevoyages.fr',
    mobile: '+33612345678',
    countries: ['France', 'Switzerland', 'Italy', 'Spain'],
    destinations: [
      { country: 'France', city: 'Paris' },
      { country: 'Switzerland', city: 'Zurich' },
      { country: 'Italy', city: 'Rome' },
      { country: 'Italy', city: 'Venice' },
      { country: 'Spain', city: 'Barcelona' },
    ],
    specializations: ['CITY_TOURS', 'LUXURY', 'FAMILY', 'HONEYMOON'],
    is_active: true,
    notes: 'Excellent for European multi-country tours. Multilingual guides available.',
    created_at: '2026-01-20T09:00:00Z',
  },
];
