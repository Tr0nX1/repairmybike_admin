'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useVehicles } from '@/hooks/useVehicles';
import { useServicePricing, ServicePricing } from '@/hooks/useServicePricing';
import { useEffect } from 'react';

const formSchema = z.object({
  service: z.string().min(1, 'Service is required'),
  vehicle_model: z.string().min(1, 'Vehicle model is required'),
  price: z.string().min(1, 'Price is required').refine(v => !isNaN(parseFloat(v)), 'Price must be a number'),
});

interface PricingFormModalProps {
  open: boolean;
  onClose: () => void;
  pricing?: ServicePricing | null;
}

export function PricingFormModal({ open, onClose, pricing }: PricingFormModalProps) {
  const isEdit = !!pricing;
  const { createPricing, updatePricing } = useServicePricing();
  const { data: servicesData } = useServices({ limit: 100 });
  const { useAllModels } = useVehicles();
  const { data: modelsData } = useAllModels();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service: '',
      vehicle_model: '',
      price: '',
    },
  });

  useEffect(() => {
    if (pricing) {
      form.reset({
        service: pricing.service.toString(),
        vehicle_model: pricing.vehicle_model.toString(),
        price: pricing.price,
      });
    } else {
      form.reset({
        service: '',
        vehicle_model: '',
        price: '',
      });
    }
  }, [pricing, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      service: parseInt(values.service),
      vehicle_model: parseInt(values.vehicle_model),
      price: values.price,
    };

    if (isEdit && pricing) {
      updatePricing.mutate({ id: pricing.id, ...data }, { onSuccess: onClose });
    } else {
      createPricing.mutate(data, { onSuccess: onClose });
    }
  };

  const isPending = createPricing.isPending || updatePricing.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Labor Rate' : 'Add Labor Rate'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                    <FormControl>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servicesData?.data.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicle_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                    <FormControl>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {modelsData?.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labor Price (₹)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 499" className="text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="text-xs font-bold uppercase">Cancel</Button>
              <Button type="submit" disabled={isPending} className="text-xs font-bold uppercase bg-[#378ADD]">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Add Rate'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
