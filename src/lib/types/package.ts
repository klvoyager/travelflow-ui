export type PackageCategory =
  | 'INTERNATIONAL'
  | 'DOMESTIC'
  | 'CRUISE'
  | 'HONEYMOON'
  | 'ADVENTURE'
  | 'GROUP'
  | 'PILGRIMAGE';

export type PackageType =
  | 'FIT'
  | 'GROUP'
  | 'SERIES'
  | 'CHARTER'
  | 'CRUISE'
  | 'ADVENTURE'
  | 'LUXURY';

export type PackageStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'ARCHIVED';

export type PackageInclusion =
  | 'FLIGHT'
  | 'HOTEL'
  | 'MEALS'
  | 'TRANSFERS'
  | 'SIGHTSEEING'
  | 'VISA'
  | 'INSURANCE'
  | 'GUIDE';

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals_included: string[];
  accommodation?: string;
  highlights: string[];
}

export interface PackagePricingTier {
  season: 'LOW' | 'SHOULDER' | 'HIGH' | 'PEAK' | 'FESTIVAL';
  valid_from: string;
  valid_to: string;
  price_per_adult: number;
  price_per_child?: number;
  currency: string;
}

export interface TravelPackage {
  package_id: string;
  package_code: string;
  tenant_id: string;
  package_name: string;
  package_category: PackageCategory;
  package_type: PackageType;
  status: PackageStatus;
  destinations: { country: string; city: string }[];
  duration_days: number;
  duration_nights: number;
  min_pax: number;
  max_pax?: number;
  inclusions: PackageInclusion[];
  itinerary: ItineraryDay[];
  pricing_tiers: PackagePricingTier[];
  cover_image_url?: string;
  gallery_urls?: string[];
  highlights: string[];
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
}
