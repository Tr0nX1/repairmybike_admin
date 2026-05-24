'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  is_staff: boolean;
  is_superuser: boolean;
  is_manager: boolean;
  is_active: boolean;
}

export function RoleBadge({ is_staff, is_superuser, is_manager, is_active }: RoleBadgeProps) {
  if (!is_active) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
        Inactive
      </Badge>
    );
  }

  const badges = [] as React.ReactNode[];

  if (is_superuser) {
    badges.push(
      <Badge key="superuser" className="bg-purple-100 text-purple-700 border-purple-200">
        Superuser
      </Badge>
    );
  }

  if (is_manager) {
    badges.push(
      <Badge key="manager" className="bg-indigo-100 text-indigo-700 border-indigo-200">
        Manager
      </Badge>
    );
  }

  if (is_staff) {
    badges.push(
      <Badge key="staff" className="bg-blue-100 text-blue-700 border-blue-200">
        Staff
      </Badge>
    );
  }

  if (!is_superuser && !is_manager && !is_staff) {
    badges.push(
      <Badge key="customer" className="bg-slate-100 text-slate-700 border-slate-200">
        Customer
      </Badge>
    );
  }

  return <div className="flex flex-wrap gap-2">{badges}</div>;
}
