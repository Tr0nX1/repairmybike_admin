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
import { useParts } from '@/hooks/useParts';
import { ApiResponse } from '@/types/api';
import { SparePart } from '@/types/parts';
import { Loader2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';

const partSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  sku: z.string().min(3, 'SKU is required'),
  category: z.number(),
  brand: z.number(),
  sale_price: z.string().min(1, 'Price is required'),
  stock_qty: z.number().int().min(0),
  active: z.boolean(),
});

interface EditPartModalProps {
  part: SparePart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPartModal = ({ part, open, onOpenChange }: EditPartModalProps) => {
  const { updatePart } = useParts();
  
  const { data: categories } = useQuery<any[]>({
    queryKey: ['parts', 'categories'],
    queryFn: async () => {
      const response = await get<ApiResponse<any[]>>('/api/spare-parts/categories/');
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof partSchema>>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: part.name || '',
      sku: part.sku || '',
      category: Number(part.category) || 0,
      brand: Number(part.brand) || 0,
      sale_price: part.sale_price || '0',
      stock_qty: Number(part.stock_qty) || 0,
      active: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof partSchema>) => {
    try {
      await updatePart.mutateAsync({ id: part.id, ...values });
      onOpenChange(false);
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto">
        <SheetHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#378ADD] mb-2">
            <Package className="h-5 w-5" />
          </div>
          <SheetTitle>Edit Spare Part</SheetTitle>
          <SheetDescription>
            Update inventory details for {part.sku}.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item Name</FormLabel>
                  <FormControl><Input {...field} className="h-10 text-xs" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU</FormLabel>
                    <FormControl><Input {...field} className="h-10 text-xs" /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sale Price (₹)</FormLabel>
                    <FormControl><Input {...field} className="h-10 text-xs font-bold text-[#378ADD]" /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Qty</FormLabel>
                    <FormControl>
                       <Input 
                         type="number" 
                         {...field} 
                         onChange={(e) => field.onChange(Number(e.target.value))}
                         className="h-10 text-xs" 
                       />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="pt-6">
              <Button type="submit" className="w-full bg-[#378ADD] hover:bg-[#2D6FA3] text-white h-10 font-bold uppercase text-[11px] tracking-widest" disabled={updatePart.isPending}>
                {updatePart.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Part Details
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
