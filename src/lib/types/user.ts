export type RoleCode =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'MANAGER'
  | 'SENIOR_AGENT'
  | 'AGENT'
  | 'SUPPORT'
  | 'ACCOUNTS'
  | 'DMC_PARTNER'
  | 'READ_ONLY';

export interface User {
  user_id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  role_code: RoleCode;
  assignment_group?: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Customer {
  customer_id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  mobile: string;
  nationality?: string;
  passport_number?: string;
  date_of_birth?: string;
  address?: string;
  total_enquiries: number;
  total_trips: number;
  lifetime_value: number;
  currency: string;
  created_at: string;
}

export interface Tenant {
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  logo_url?: string;
  primary_color?: string;
  email_domain?: string;
  country: string;
  currency: string;
  timezone: string;
  is_active: boolean;
}
