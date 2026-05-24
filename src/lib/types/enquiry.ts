export type EnquiryStatus =
  | 'ENQUIRY_RECEIVED'
  | 'UNDER_REVIEW'
  | 'SOURCING_PARTNERS'
  | 'PARTNERS_RESPONDED'
  | 'PREPARING_QUOTE'
  | 'QUOTE_SENT'
  | 'REVISION_REQUESTED'
  | 'ADVANCE_PAID'
  | 'BOOKING_CONFIRMED'
  | 'ENQUIRY_CLOSED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type EnquiryType =
  | 'PACKAGE_TOUR'
  | 'FLIGHT_ONLY'
  | 'HOTEL_ONLY'
  | 'VISA_ONLY'
  | 'INSURANCE'
  | 'CUSTOM'
  | 'MULTI_SERVICE';

export type TravelPurpose =
  | 'LEISURE'
  | 'HONEYMOON'
  | 'BUSINESS'
  | 'FAMILY'
  | 'GROUP'
  | 'ADVENTURE'
  | 'PILGRIMAGE'
  | 'MEDICAL';

export type SourceChannel =
  | 'WEB'
  | 'MOBILE'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'WALK_IN'
  | 'PHONE'
  | 'REFERRAL';

export type AccommodationPref =
  | '3_STAR'
  | '4_STAR'
  | '5_STAR'
  | 'BOUTIQUE'
  | 'RESORT'
  | 'VILLA'
  | 'ANY';

export type MealPlan = 'RO' | 'BB' | 'HB' | 'FB' | 'AI' | 'UAI';

export interface Destination {
  country: string;
  city: string;
}

export interface Enquiry {
  enquiry_id: string;
  enquiry_ref: string;
  tenant_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_nationality?: string;
  enquiry_type: EnquiryType;
  travel_purpose: TravelPurpose;
  source_channel: SourceChannel;
  destinations: Destination[];
  departure_date_preferred: string;
  departure_flexible: boolean;
  return_date_preferred?: string;
  duration_days?: number;
  adults_count: number;
  children_count: number;
  children_ages?: number[];
  infants_count: number;
  budget_total?: number;
  budget_currency: string;
  accommodation_pref?: AccommodationPref;
  meal_plan_pref?: MealPlan;
  special_requests?: string;
  enquiry_status: EnquiryStatus;
  priority: Priority;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  assignment_group?: string;
  sla_review_due?: string;
  sla_quote_due?: string;
  sla_breached: boolean;
  lead_score?: number;
  dmc_forwarded: boolean;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}
