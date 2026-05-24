export type DMCForwardStatus = 'SENT' | 'RESPONDED' | 'SELECTED' | 'REJECTED' | 'EXPIRED';
export type ProposalStatus = 'RECEIVED' | 'UNDER_REVIEW' | 'APPROVED' | 'SELECTED' | 'REJECTED';
export type ProposalReceivedVia = 'PORTAL_UPLOAD' | 'EMAIL_PARSE' | 'MANUAL_ENTRY';
export type PreferredFormat = 'PDF' | 'EXCEL' | 'WORD';
export type HotelCategory = '3_STAR' | '4_STAR' | '5_STAR' | 'BOUTIQUE';

export interface DMCPartner {
  dmc_id: string;
  tenant_id: string;
  company_name: string;
  display_name?: string;
  contact_person: string;
  email: string;
  mobile: string;
  countries: string[];
  destinations: { country: string; city: string }[];
  specializations: string[];
  is_active: boolean;
  is_inhouse?: boolean;
  sla_hours?: number;
  preferred_format?: PreferredFormat;
  rating?: number;
  notes?: string;
  created_at: string;
}

export interface DMCForward {
  forward_id: string;
  enquiry_id: string;
  dmc_id: string;
  dmc_name: string;
  destination: string;
  status: DMCForwardStatus;
  message_sent?: string;
  forwarded_at: string;
  responded_at?: string;
  proposal_id?: string;
}

export interface DMCProposalOption {
  option_id: string;
  option_name: 'Deluxe' | 'Luxury' | 'Standard' | 'Budget';
  hotel_name: string;
  hotel_category: HotelCategory;
  nights: number;
  meal_plan: string;
  transport_type?: string;
  buy_price_adult?: number;
  buy_price_child_with_bed?: number;
  buy_price_child_without_bed?: number;
  buy_price_infant?: number;
  buy_currency: string;
  inclusions?: string;
  exclusions?: string;
  itinerary_summary?: string;
}

export interface DMCProposal {
  proposal_id: string;
  forward_id: string;
  enquiry_id: string;
  dmc_id: string;
  dmc_name: string;
  received_via: ProposalReceivedVia;
  status: ProposalStatus;
  attachment_url?: string;
  proposal_options: DMCProposalOption[];
  notes?: string;
  received_at: string;
  reviewed_at?: string;
}
