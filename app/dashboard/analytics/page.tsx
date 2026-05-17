'use client';

import { useBookings } from '@/hooks/useBookings';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo } from 'react';
import { format, subDays, isAfter, startOfDay, parseISO } from 'date-fns';
import { Loader2, TrendingUp, TrendingDown, Users, CalendarCheck, IndianRupee, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- INLINE CHART COMPONENTS ---

const SimpleBarChart = ({ data, color = '#378ADD' }: { data: { label: string; value: number }[], color?: string }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex h-[180px] items-end justify-between gap-2 px-2 pb-6">
      {data.map((item, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center">
          <div 
            className="w-full rounded-t-sm transition-all hover:opacity-80"
            style={{ 
              height: `${(item.value / maxVal) * 100}%`, 
              backgroundColor: color 
            }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="absolute -bottom-6 text-[9px] font-bold text-muted-foreground uppercase">{item.label}</span>
          <div className="absolute -top-8 hidden rounded bg-slate-800 px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap z-10">
            {item.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments }: { segments: { label: string; value: number; color: string }[] }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;
  const gradientParts = segments.map(s => {
    const start = (cumulative / total) * 100;
    cumulative += s.value;
    const end = (cumulative / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });

  return (
    <div className="flex items-center gap-6">
      <div 
        className="h-32 w-32 rounded-full relative" 
        style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
      >
        <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{total}</span>
          <span className="text-[8px] text-muted-foreground uppercase font-bold">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{s.label}</span>
            <span className="text-[10px] font-bold ml-auto">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#378ADD] rounded-full transition-all duration-500" 
              style={{ width: `${(item.value / maxVal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// --- MAIN PAGE ---

export default function AnalyticsPage() {
  const { data: bookingsData, isLoading } = useBookings({ limit: 200 });
  const bookings = bookingsData?.data || [];

  const stats = useMemo(() => {
    if (bookings.length === 0) return null;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    const revenueByDay = last7Days.map(day => {
      const dayTotal = bookings
        .filter(b => b.appointment_date === day && b.payment_status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
      return { label: format(parseISO(day), 'EEE'), value: dayTotal };
    });

    const statusCounts = bookings.reduce((acc, b) => {
      acc[b.booking_status] = (acc[b.booking_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const serviceCounts = bookings.flatMap(b => b.booking_services).reduce((acc, s) => {
      acc[s.service] = (acc[s.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topServices = Object.entries(serviceCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const totalRevenue = bookings
      .filter(b => b.payment_status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
    
    const completedCount = bookings.filter(b => b.booking_status === 'completed').length;
    const avgValue = completedCount > 0 ? totalRevenue / completedCount : 0;
    const cancelledCount = bookings.filter(b => b.booking_status === 'cancelled').length;
    const cancellationRate = bookings.length > 0 ? (cancelledCount / bookings.length) * 100 : 0;

    return {
      revenueByDay,
      statusCounts,
      topServices,
      totalRevenue,
      completedCount,
      avgValue,
      cancellationRate
    };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#378ADD]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Business Analytics" 
        subtitle="Data-driven insights into your service operations"
        actions={
          <Tabs defaultValue="7d" className="h-9">
            <TabsList className="bg-white border">
              <TabsTrigger value="7d" className="text-[10px] uppercase font-bold">7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="text-[10px] uppercase font-bold">30 Days</TabsTrigger>
              <TabsTrigger value="custom" className="text-[10px] uppercase font-bold">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[0.5px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center justify-between">
              Total Revenue <IndianRupee className="h-3 w-3 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-[10px] font-bold text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="border-[0.5px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center justify-between">
              Bookings Completed <CalendarCheck className="h-3 w-3 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedCount}</div>
            <div className="flex items-center text-[10px] font-bold text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +8.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="border-[0.5px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center justify-between">
              Avg. Booking Value <TrendingUp className="h-3 w-3 text-[#378ADD]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(stats?.avgValue || 0).toLocaleString()}</div>
            <div className="flex items-center text-[10px] font-bold text-muted-foreground mt-1">
              Based on {stats?.completedCount} invoices
            </div>
          </CardContent>
        </Card>

        <Card className="border-[0.5px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center justify-between">
              Cancellation Rate <Ban className="h-3 w-3 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cancellationRate.toFixed(1)}%</div>
            <div className="flex items-center text-[10px] font-bold text-red-600 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" /> -2.1% improvement
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[0.5px] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={stats?.revenueByDay || []} />
          </CardContent>
        </Card>

        <Card className="border-[0.5px] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Booking Status Split</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <DonutChart segments={[
              { label: 'Completed', value: stats?.statusCounts.completed || 0, color: '#22C55E' },
              { label: 'Pending', value: stats?.statusCounts.pending || 0, color: '#F59E0B' },
              { label: 'Cancelled', value: stats?.statusCounts.cancelled || 0, color: '#EF4444' },
              { label: 'Other', value: (stats?.statusCounts.confirmed || 0) + (stats?.statusCounts.started || 0), color: '#3B82F6' },
            ]} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[0.5px] shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={stats?.topServices || []} />
          </CardContent>
        </Card>

        <Card className="border-[0.5px] shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Mechanic</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px] text-right">Jobs</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px] text-right">Revenue</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px] text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { name: 'Rahul Sharma', jobs: 42, rev: 48500, rating: 4.8 },
                    { name: 'Suresh Kumar', jobs: 38, rev: 41200, rating: 4.9 },
                    { name: 'Amit Singh', jobs: 31, rev: 32900, rating: 4.6 },
                  ].map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold">{m.name}</td>
                      <td className="px-4 py-3 text-right">{m.jobs}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#378ADD]">₹{m.rev.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">{m.rating}★</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
