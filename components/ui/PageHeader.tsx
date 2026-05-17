'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  badge?: {
    label: string | number;
    color?: string;
  };
}

export const PageHeader = ({ title, subtitle, actions, badge }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-foreground">{title}</h1>
            {badge && (
              <Badge 
                variant="secondary" 
                className={cn("px-1.5 py-0 text-[10px] font-bold", badge.color || "bg-[#378ADD] text-white")}
              >
                {badge.label}
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
