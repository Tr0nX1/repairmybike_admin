'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { usePlans, Plan } from '@/hooks/usePlans';
import { Loader2, Zap } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const planSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  price: z.string().min(1, 'Price is required'),
  billing_period: z.string().min(1, 'Required'),
  included_visits: z.number().int().min(0),
  tier: z.string().min(1, 'Required'),
  active: z.boolean(),
  description: z.string().optional(),
});

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Plan;
}

export const PlanFormModal = ({ open, onOpenChange, initialData }: PlanFormModalProps) => {
  const { createPlan, updatePlan } = usePlans();
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || '0.00',
      billing_period: initialData?.billing_period || 'monthly',
      included_visits: initialData?.included_visits || 0,
      tier: initialData?.tier || 'silver',
      active: initialData?.active ?? true,
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof planSchema>) => {
    try {
      if (isEditing) {
        await updatePlan.mutateAsync({ id: initialData.id, ...values });
      } else {
        await createPlan.mutateAsync(values);
      }
      onOpenChange(false);
      form.reset();
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-[#9333EA] mb-2">
            <Zap className="h-5 w-5" />
          </div>
          <SheetTitle>{isEditing ? 'Edit Plan' : 'Create New Plan'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the details of your service plan.' : 'Define a new membership plan for your customers.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Plan Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Pro Membership" {...field} className="h-10 text-xs" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (₹)</FormLabel>
                    <FormControl><Input placeholder="999.00" {...field} className="h-10 text-xs font-bold" /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billing_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Billing Cycle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one_time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Plan Tier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="included_visits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service Visits</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="h-10 text-xs" 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</FormLabel>
                  <FormControl><Textarea placeholder="What's included in this plan..." {...field} className="text-xs resize-none" rows={3} /></FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs font-bold">Set as Active</FormLabel>
                    <p className="text-[10px] text-muted-foreground">Customers can see and purchase this plan if active.</p>
                  </div>
                </FormItem>
              )}
            />

            <SheetFooter className="pt-6">
              <Button type="submit" className="w-full bg-[#378ADD] hover:bg-[#2D6FA3] text-white h-10 font-bold uppercase text-[11px] tracking-widest" disabled={createPlan.isPending || updatePlan.isPending}>
                {createPlan.isPending || updatePlan.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? 'Save Changes' : 'Create Plan'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
