export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REVISION_REQUESTED'
  | 'EXPIRED'
  | 'REJECTED';

export type BudgetOptionName = 'Deluxe' | 'Luxury' | 'Standard' | 'Budget';

export interface PricingBreakdown {
  buy_price: number;
  service_charge_pct: number;
  service_charge_amount: number;
  gst_pct: number;
  gst_amount: number;
  subtotal: number;
  tds_pct: number;
  tds_amount: number;
  final_selling_price: number;
  apply_tds: boolean;
}

export interface PaxPricing {
  buy_price: number;
  breakdown: PricingBreakdown;
}

export interface BudgetOption {
  option_id: string;
  option_name: BudgetOptionName;
  sort_order: number;
  hotel_name: string;
  hotel_category: '3_STAR' | '4_STAR' | '5_STAR' | 'BOUTIQUE';
  nights: number;
  meal_plan: string;
  transport_type?: string;
  flight_class?: string;
  airline?: string;
  inclusions: string[];
  exclusions: string[];
  itinerary_summary?: string;
  adult_pricing?: PaxPricing;
  child_with_bed_pricing?: PaxPricing;
  child_without_bed_pricing?: PaxPricing;
  infant_pricing?: PaxPricing;
  is_recommended: boolean;
  proposal_id?: string;
  proposal_option_id?: string;
  notes?: string;
}

export interface Quotation {
  quotation_id: string;
  quotation_ref: string;
  enquiry_id: string;
  tenant_id: string;
  version: number;
  status: QuotationStatus;
  trip_title: string;
  guest_name: string;
  departure_date: string;
  return_date: string;
  duration_days: number;
  adults_count: number;
  children_count: number;
  infants_count: number;
  budget_options: BudgetOption[];
  currency: string;
  valid_until: string;
  payment_terms?: string;
  cancellation_policy?: string;
  agent_note?: string;
  terms_and_conditions?: string;
  prepared_by_id: string;
  prepared_by_name: string;
  sent_at?: string;
  viewed_at?: string;
  accepted_at?: string;
  accepted_option_id?: string;
  guest_feedback?: string;
  created_at: string;
  updated_at: string;
}
