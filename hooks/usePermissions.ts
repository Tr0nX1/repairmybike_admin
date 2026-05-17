'use client';

import { useAuthStore } from '@/store/auth.store';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  
  const role = user?.role || 'staff';
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';

  const permissionsMap: Record<string, boolean> = {
    'edit:inventory': isAdmin,
    'view:logs': isAdmin,
    'manage:staff': isAdmin,
    'view:settings': isAdmin,
    'assign:mechanic': isAdmin || isStaff,
    'update:booking_status': isAdmin || isStaff,
    'verify:cash': isAdmin || isStaff,
  };

  const can = (action: string) => {
    return permissionsMap[action] || false;
  };

  return {
    isAdmin,
    isStaff,
    role,
    can,
  };
};
