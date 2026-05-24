import type { Destination } from './enquiry';

export type TripStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ESCALATION' | 'COMPLETED' | 'CANCELLED';
export type HotnessFlag = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PaymentType = 'ADVANCE' | 'BALANCE' | 'INTERIM' | 'REFUND' | 'ADJUSTMENT';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'CHEQUE' | 'ONLINE';

export type EscalationType =
  | 'HOTEL_ISSUE'
  | 'FLIGHT'
  | 'TRANSFER'
  | 'HEALTH'
  | 'SAFETY'
  | 'SERVICE'
  | 'BILLING'
  | 'OTHER';

export type EscalationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EscalationStatus = 'OPEN' | 'IN_RESOLUTION' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

export interface TripPayment {
  payment_id: string;
  trip_id: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  paid_at: string;
  reference_number?: string;
  notes?: string;
}

export interface TripEscalation {
  escalation_id: string;
  trip_id: string;
  escalation_type: EscalationType;
  severity: EscalationSeverity;
  status: EscalationStatus;
  description: string;
  raised_by: string;
  raised_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface Trip {
  trip_id: string;
  trip_ref: string;
  enquiry_id: string;
  trip_title: string;
  trip_status: TripStatus;
  hotness_flag: HotnessFlag;
  departure_date: string;
  return_date: string;
  duration_days: number;
  lead_guest_id: string;
  lead_guest_name: string;
  lead_guest_email: string;
  lead_guest_mobile: string;
  pax_total: number;
  pax_adults: number;
  pax_children: number;
  assigned_agent_id: string;
  assigned_agent_name: string;
  dmc_id?: string;
  dmc_name?: string;
  selected_option_name: string;
  destinations: Destination[];
  total_selling_price: number;
  advance_amount: number;
  balance_due: number;
  balance_due_date?: string;
  balance_paid: boolean;
  full_payment_flag: boolean;
  currency: string;
  dmc_notified: boolean;
  tax_invoice_generated: boolean;
  escalation_count: number;
  payments?: TripPayment[];
  escalations?: TripEscalation[];
  created_at: string;
}
