'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorBarProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBar = ({ message, onRetry, className }: ErrorBarProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50 shadow-sm",
      className
    )}>
      <div className="flex items-center gap-3">
        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
        <span className="text-xs font-bold text-red-800 leading-tight">
          {message || "An unexpected error occurred while fetching data."}
        </span>
      </div>
      {onRetry && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="h-7 text-[10px] font-bold uppercase text-red-700 hover:bg-red-100 gap-1.5"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </Button>
      )}
    </div>
  );
};
