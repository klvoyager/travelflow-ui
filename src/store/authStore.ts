'use client';

import { create } from 'zustand';
import type { User, Tenant, RoleCode } from '@/lib/types';
import { mockUsers, mockTenant } from '@/lib/mock';

interface AuthState {
  currentUser: User;
  tenant: Tenant;
  getCurrentUser: () => User;
  getTenant: () => Tenant;
  hasRole: (roles: RoleCode[]) => boolean;
  isAtLeastRole: (minLevel: number) => boolean;
}

const ROLE_LEVELS: Record<RoleCode, number> = {
  SUPER_ADMIN:  100,
  TENANT_ADMIN: 80,
  MANAGER:      60,
  SENIOR_AGENT: 50,
  AGENT:        40,
  SUPPORT:      30,
  ACCOUNTS:     30,
  DMC_PARTNER:  10,
  READ_ONLY:    5,
};

export const useAuthStore = create<AuthState>()(() => ({
  currentUser: mockUsers[0], // Rahul Menon — AGENT
  tenant: mockTenant,

  getCurrentUser: () => mockUsers[0],
  getTenant: () => mockTenant,

  hasRole: (roles: RoleCode[]) => {
    return roles.includes(mockUsers[0].role_code);
  },

  isAtLeastRole: (minLevel: number) => {
    return (ROLE_LEVELS[mockUsers[0].role_code] ?? 0) >= minLevel;
  },
}));
