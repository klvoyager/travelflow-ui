import type { RoleCode } from '@/lib/types';

export interface RoleConfig {
  code: RoleCode;
  label: string;
  description: string;
  level: number;
}

export const ROLES: RoleConfig[] = [
  { code: 'SUPER_ADMIN',   label: 'Super Admin',    description: 'Full platform access',               level: 100 },
  { code: 'TENANT_ADMIN',  label: 'Tenant Admin',   description: 'Full tenant access',                 level: 80  },
  { code: 'MANAGER',       label: 'Manager',        description: 'Team management + reports',          level: 60  },
  { code: 'SENIOR_AGENT',  label: 'Senior Agent',   description: 'All enquiries + team visibility',    level: 50  },
  { code: 'AGENT',         label: 'Agent',          description: 'Own enquiries and trips',            level: 40  },
  { code: 'SUPPORT',       label: 'Support',        description: 'Operational support tasks',          level: 30  },
  { code: 'ACCOUNTS',      label: 'Accounts',       description: 'Payments and invoices only',         level: 30  },
  { code: 'DMC_PARTNER',   label: 'DMC Partner',    description: 'DMC portal access only',             level: 10  },
  { code: 'READ_ONLY',     label: 'Read Only',      description: 'View-only across modules',           level: 5   },
];

export function getRoleConfig(code: RoleCode): RoleConfig | undefined {
  return ROLES.find(r => r.code === code);
}
