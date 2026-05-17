'use client';

import { useBookingStats } from '@/hooks/useBookingStats';
import { cn } from '@/lib/utils';
import { Calendar, UserCheck, Banknote, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: any;
  accent: 'blue' | 'amber' | 'green' | 'red';
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard = ({ label, value, subtext, icon: Icon, accent, trend }: StatCardProps) => {
  const accentColors = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border-[0.5px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn("p-1.5 rounded-md", accentColors[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <div className="text-[10px] text-muted-foreground mt-1 font-medium">{subtext}</div>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            trend.positive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}>
            {trend.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};

export const StatsGrid = () => {
  const { data: stats, isLoading } = useBookingStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const pendingCount = stats?.booking_status?.pending || 0;
  const cashToCollect = (stats?.payment_status?.pending || 0); // Simplified logic

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Today's bookings"
        value={stats?.total_bookings || 0}
        subtext="Total appointments scheduled"
        icon={Calendar}
        accent="blue"
        trend={{ value: '12%', positive: true }}
      />
      <StatCard
        label="Pending assignment"
        value={pendingCount}
        subtext={pendingCount > 0 ? "Mechanics need to be assigned" : "All jobs assigned"}
        icon={UserCheck}
        accent={pendingCount > 0 ? "amber" : "green"}
      />
      <StatCard
        label="Cash to collect"
        value={`₹${(cashToCollect * 1200).toLocaleString()}`} // Mocked calculation
        subtext="Pending physical reconciliation"
        icon={Banknote}
        accent="amber"
      />
      <StatCard
        label="Low stock parts"
        value={3} // Mocked value
        subtext="Items below minimum threshold"
        icon={AlertTriangle}
        accent="red"
      />
    </div>
  );
};
