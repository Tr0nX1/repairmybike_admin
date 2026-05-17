'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, Plus, Loader2, Send } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useBookings } from '@/hooks/useBookings';
import { useServices } from '@/hooks/useServices';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const walkInSchema = z.object({
  customer_phone: z.string().min(10, 'Valid phone required'),
  service_id: z.string().min(1, 'Required'),
  vehicle_type: z.enum(['motorcycle', 'scooter']),
});

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [lastRefreshed, setLastRefreshed] = useState(0);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const { createQuickService } = useBookings();
  const { data: servicesData } = useServices();
  const services = servicesData?.data || [];

  const form = useForm<z.infer<typeof walkInSchema>>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      customer_phone: '',
      service_id: '',
      vehicle_type: 'motorcycle',
    },
  });

  const onWalkInSubmit = async (values: z.infer<typeof walkInSchema>) => {
    try {
      const res = await createQuickService.mutateAsync({
        phone: values.customer_phone,
        service_ids: [parseInt(values.service_id)],
        vehicle_type: values.vehicle_type,
        service_location: 'shop',
      });
      setIsWalkInOpen(false);
      form.reset();
      if (res.data?.id) {
        router.push(`/dashboard/bookings/${res.data.id}`);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefreshed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['logs'] });
    setLastRefreshed(0);
  };

  const RevenueChart = () => (
    <div className="flex flex-col rounded-lg bg-white shadow-sm border-[0.5px] p-4 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revenue Trend (Last 7 Days)</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[#378ADD]" />
            <span className="text-[10px] text-muted-foreground">Revenue</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-2 pb-2">
        {[
          { day: 'Mon', val: 40 },
          { day: 'Tue', val: 65 },
          { day: 'Wed', val: 35 },
          { day: 'Thu', val: 80 },
          { day: 'Fri', val: 55 },
          { day: 'Sat', val: 90 },
          { day: 'Sun', val: 70 },
        ].map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
            <div 
              className="w-full bg-[#378ADD] rounded-t-sm transition-all hover:bg-[#2D6FA3] cursor-pointer" 
              style={{ height: `${item.val}%` }}
              title={`₹${item.val * 500}`}
            />
            <span className="text-[10px] text-muted-foreground">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Operations Dashboard" 
        subtitle="Real-time overview of your service operations"
        actions={
          <div className="flex items-center gap-2">
            <Button className="h-8 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]" onClick={() => setIsWalkInOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Walk-in
            </Button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleRefresh}>
              <RefreshCw className={lastRefreshed === 0 ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Walk-in Modal */}
      <Dialog open={isWalkInOpen} onOpenChange={setIsWalkInOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Quick Walk-in Booking</DialogTitle>
            <DialogDescription>
              Rapidly create a new job card for a customer at the shop.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onWalkInSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase">Customer Phone</FormLabel>
                    <FormControl><Input placeholder="+91..." {...field} className="h-10 text-xs" /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase">Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="scooter">Scooter</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase">Service</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-[#10B981] text-white font-bold h-10 uppercase text-[11px] tracking-widest gap-2" disabled={createQuickService.isPending}>
                  {createQuickService.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Create Job Card
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      <RecentBookings />
    </div>
  );
}
