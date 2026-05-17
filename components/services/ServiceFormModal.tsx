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
import { useServices, Service } from '@/hooks/useServices';
import { Loader2, Wrench } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

const serviceSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  service_category: z.number().min(1, 'Required'),
  description: z.string().min(10, 'Provide a clear description'),
  is_featured: z.boolean(),
});

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Service;
}

export const ServiceFormModal = ({ open, onOpenChange, initialData }: ServiceFormModalProps) => {
  const { createService, updateService } = useServices();
  const isEditing = !!initialData;

  const { data: categories } = useQuery<any[]>({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const response = await get<ApiResponse<any[]>>('/api/services/service-categories/');
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || '',
      service_category: initialData?.service_category || 0,
      description: initialData?.description || '',
      is_featured: initialData?.is_featured ?? false,
    },
  });

  const onSubmit = async (values: z.infer<typeof serviceSchema>) => {
    try {
      if (isEditing) {
        await updateService.mutateAsync({ id: initialData.id, ...values });
      } else {
        await createService.mutateAsync(values);
      }
      onOpenChange(false);
      form.reset();
    } catch (e) {}
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#378ADD] mb-2">
            <Wrench className="h-5 w-5" />
          </div>
          <SheetTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Modify service attributes in the master catalog.' : 'Define a new core service for the RepairMyBike platform.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Engine Diagnostics" {...field} className="h-10 text-xs" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ? field.value.toString() : ""}>
                    <FormControl>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</FormLabel>
                  <FormControl><Textarea placeholder="Detailed breakdown of work involved..." {...field} className="text-xs resize-none" rows={4} /></FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs font-bold">Feature on Homepage</FormLabel>
                    <p className="text-[10px] text-muted-foreground">Display this service in the customer app hero section.</p>
                  </div>
                </FormItem>
              )}
            />

            <SheetFooter className="pt-6">
              <Button type="submit" className="w-full bg-[#378ADD] hover:bg-[#2D6FA3] text-white h-10 font-bold uppercase text-[11px] tracking-widest" disabled={createService.isPending || updateService.isPending}>
                {createService.isPending || updateService.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? 'Update Service' : 'Publish Service'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
