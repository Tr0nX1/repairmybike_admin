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
import { useServices } from '@/hooks/useServices';
import { Loader2, Zap, Plus, X, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';

const planSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  price: z.string().min(1, 'Price is required'),
  billing_period: z.string().min(1, 'Required'),
  included_visits: z.number().int().min(0),
  tier: z.string().min(1, 'Required'),
  included_services: z.array(z.number()).optional(),
  active: z.boolean(),
  description: z.string().optional(),
});

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Plan;
}

export const PlanFormModal = ({ open, onOpenChange, initialData }: PlanFormModalProps) => {
  const { createPlan, updatePlan, addBenefit, removeBenefit, updateBenefit } = usePlans();
  const { data: serviceResults } = useServices({}, 1);
  const isEditing = !!initialData;
  const [newBenefit, setNewBenefit] = useState('');
  const [selectedServices, setSelectedServices] = useState<number[]>(initialData?.included_services || []);
  const [benefits, setBenefits] = useState(initialData?.benefits_list || []);
  const [benefitEdits, setBenefitEdits] = useState<Record<number, string>>({});
  const [benefitActive, setBenefitActive] = useState<Record<number, boolean>>({});

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

  useEffect(() => {
    setSelectedServices(initialData?.included_services ?? []);
    setBenefits(initialData?.benefits_list ?? []);
    setBenefitEdits(
      (initialData?.benefits_list || []).reduce((acc, benefit) => {
        acc[benefit.id] = benefit.text;
        return acc;
      }, {} as Record<number, string>)
    );
    setBenefitActive(
      (initialData?.benefits_list || []).reduce((acc, benefit) => {
        acc[benefit.id] = benefit.is_active;
        return acc;
      }, {} as Record<number, boolean>)
    );

    form.reset({
      name: initialData?.name || '',
      price: initialData?.price || '0.00',
      billing_period: initialData?.billing_period || 'monthly',
      included_visits: initialData?.included_visits || 0,
      tier: initialData?.tier || 'silver',
      active: initialData?.active ?? true,
      description: initialData?.description || '',
      included_services: initialData?.included_services || [],
    });
  }, [initialData, form]);

  const handleAddBenefit = async () => {
    if (!initialData?.id || !newBenefit.trim()) return;
    try {
      const benefit = await addBenefit.mutateAsync({ planId: initialData.id, text: newBenefit.trim() });
      if (benefit) {
        setBenefits((prev) => [...(prev || []), benefit]);
        setBenefitEdits((prev) => ({ ...prev, [benefit.id]: benefit.text }));
        setBenefitActive((prev) => ({ ...prev, [benefit.id]: benefit.is_active }));
      }
      setNewBenefit('');
    } catch (e) {}
  };

  const handleRemoveBenefit = async (benefitId: number) => {
    if (!initialData?.id) return;
    try {
      await removeBenefit.mutateAsync({ planId: initialData.id, benefitId });
      setBenefits((prev) => (prev || []).filter((item) => item.id !== benefitId));
      setBenefitEdits((prev) => {
        const next = { ...prev };
        delete next[benefitId];
        return next;
      });
      setBenefitActive((prev) => {
        const next = { ...prev };
        delete next[benefitId];
        return next;
      });
    } catch (e) {}
  };

  const handleUpdateBenefit = async (benefitId: number) => {
    if (!initialData?.id) return;
    const text = benefitEdits[benefitId]?.trim();
    const is_active = benefitActive[benefitId];
    if (text === undefined || text.length === 0) return;

    try {
      const updated = await updateBenefit.mutateAsync({
        planId: initialData.id,
        benefitId,
        text,
        is_active,
      });
      if (updated) {
        setBenefits((prev) => (prev || []).map((item) => item.id === benefitId ? updated : item));
      }
    } catch (e) {}
  };

  const onSubmit = async (values: z.infer<typeof planSchema>) => {
    try {
      const payload = { ...values, included_services: selectedServices };
      if (isEditing) {
        await updatePlan.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createPlan.mutateAsync(payload);
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

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Included Services</span>
                <span className="text-[10px] font-semibold text-slate-600">{selectedServices.length} selected</span>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pt-2">
                {(serviceResults?.data || []).map((service) => {
                  const selected = selectedServices.includes(service.id);
                  return (
                    <button
                      type="button"
                      key={service.id}
                      className={`rounded-lg border px-3 py-2 text-left text-xs ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                      onClick={() => {
                        setSelectedServices((prev) =>
                          prev.includes(service.id)
                            ? prev.filter((id) => id !== service.id)
                            : [...prev, service.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{service.name}</span>
                        <span className="text-[10px] text-slate-500">Service</span>
                      </div>
                    </button>
                  );
                })}
                {!serviceResults?.data?.length && (
                  <div className="text-[10px] text-slate-500">No services loaded yet.</div>
                )}
              </div>
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

            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Plan Benefits</FormLabel>
                  <span className="text-[10px] font-semibold text-slate-600">{benefits.length} benefits</span>
                </div>
                <div className="space-y-3">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                          <Input
                            value={benefitEdits[benefit.id] ?? benefit.text}
                            onChange={(e) => setBenefitEdits((prev) => ({ ...prev, [benefit.id]: e.target.value }))}
                            className="h-10 text-xs"
                          />
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <Checkbox
                              checked={benefitActive[benefit.id] ?? benefit.is_active}
                              onCheckedChange={(value) => setBenefitActive((prev) => ({ ...prev, [benefit.id]: Boolean(value) }))}
                            />
                            <span>{benefitActive[benefit.id] ?? benefit.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs"
                            onClick={() => handleUpdateBenefit(benefit.id)}
                            disabled={updateBenefit.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs text-red-600"
                            onClick={() => handleRemoveBenefit(benefit.id)}
                            disabled={removeBenefit.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a benefit..." 
                    value={newBenefit} 
                    onChange={(e) => setNewBenefit(e.target.value)}
                    className="h-9 text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    className="h-9 bg-purple-600 hover:bg-purple-700"
                    onClick={handleAddBenefit}
                    disabled={addBenefit.isPending || !newBenefit.trim()}
                  >
                    {addBenefit.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

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
