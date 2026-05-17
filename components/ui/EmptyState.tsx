'use client';

import { ReactNode } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, subtitle, action, icon, className }: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-6 rounded-md border border-dashed bg-white",
      className
    )}>
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-muted-foreground">
        {icon || <Search className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1 max-w-[280px] text-center leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-6 h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
