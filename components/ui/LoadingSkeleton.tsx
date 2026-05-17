'use client';

import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingSkeleton = ({ rows = 5, columns = 4, className }: LoadingSkeletonProps) => {
  return (
    <div className={cn("rounded-md border bg-white overflow-hidden shadow-sm", className)}>
      <div className="bg-slate-50/50 border-b p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-2/3" />
        ))}
      </div>
      <div className="p-4 space-y-6">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, j) => {
              // Randomise widths to look more natural
              const widths = ['w-full', 'w-3/4', 'w-2/3', 'w-1/2', 'w-4/5'];
              const width = widths[(i + j) % widths.length];
              return <Skeleton key={j} className={cn("h-4", width)} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
