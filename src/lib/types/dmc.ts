export type DMCForwardStatus = 'SENT' | 'RESPONDED' | 'SELECTED' | 'REJECTED' | 'EXPIRED';
export type ProposalStatus = 'RECEIVED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface DMCPartner {
  dmc_id: string;
  tenant_id: string;
  company_name: string;
  contact_person: string;
  email: string;
  mobile: string;
  countries: string[];
  destinations: { country: string; city: string }[];
  specializations: string[];
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface DMCForward {
  forward_id: string;
  enquiry_id: string;
  dmc_id: string;
  dmc_name: string;
  status: DMCForwardStatus;
  message_sent?: string;
  forwarded_at: string;
  responded_at?: string;
  proposal_id?: string;
}

export interface DMCProposal {
  proposal_id: string;
  forward_id: string;
  enquiry_id: string;
  dmc_id: string;
  received_via: 'PORTAL_UPLOAD' | 'EMAIL_PARSE' | 'MANUAL_ENTRY';
  status: ProposalStatus;
  option_name: string;
  buy_price: number;
  currency: string;
  hotel_name?: string;
  meal_plan?: string;
  inclusions?: string[];
  validity_date: string;
  notes?: string;
  attachment_url?: string;
  received_at: string;
  reviewed_at?: string;
}
