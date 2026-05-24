'use client';

import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { currentUser, tenant, hasRole, isAtLeastRole } = useAuthStore();
  return { currentUser, tenant, hasRole, isAtLeastRole };
}
