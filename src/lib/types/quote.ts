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

export interface BudgetOption {
  option_id: string;
  quotation_id: string;
  option_name: BudgetOptionName;
  sort_order: number;
  hotel_name: string;
  hotel_category: string;
  room_type: string;
  meal_plan: string;
  flight_class?: string;
  airline?: string;
  inclusions: string[];
  exclusions: string[];
  validity_date: string;
  pricing: PricingBreakdown;
  is_recommended: boolean;
  notes?: string;
}

export interface Quotation {
  quotation_id: string;
  quotation_ref: string;
  enquiry_id: string;
  tenant_id: string;
  version: number;
  status: QuotationStatus;
  budget_options: BudgetOption[];
  currency: string;
  valid_until: string;
  prepared_by_id: string;
  prepared_by_name: string;
  sent_at?: string;
  viewed_at?: string;
  accepted_at?: string;
  accepted_option_id?: string;
  guest_feedback?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}
