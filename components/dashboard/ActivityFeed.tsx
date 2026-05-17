'use client';

import { useLogs } from '@/hooks/useLogs';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export const ActivityFeed = () => {
  const { isAdmin } = usePermissions();
  const { data: logs, isLoading } = useLogs({ limit: 10 });

  const getStatusColor = (actionType: string) => {
    switch (actionType) {
      case 'status_change': return 'bg-blue-500';
      case 'part_added': return 'bg-amber-500';
      case 'part_removed': return 'bg-gray-500';
      case 'stock_update': return 'bg-purple-500';
      case 'error': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="flex flex-col rounded-lg bg-white shadow-sm border-[0.5px]">
      <div className="border-b p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activity Feed</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : logs?.results?.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
            No recent activity
          </div>
        ) : (
          logs?.results?.map((log) => (
            <div key={log.id} className="flex gap-3">
              <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", getStatusColor(log.action_type))} />
              <div className="flex flex-col">
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-semibold">{log.full_name}</span> {log.description}
                </p>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <div className="border-t p-3 text-center">
          <Link 
            href="/dashboard/logs" 
            className="text-[10px] font-bold uppercase tracking-wider text-[#378ADD] hover:underline"
          >
            View all logs →
          </Link>
        </div>
      )}
    </div>
  );
};
