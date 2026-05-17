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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useBrands } from '@/hooks/useParts';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  logo: z.any().optional(),
});

interface BrandFormModalProps {
  open: boolean;
  onClose: () => void;
  brand?: any | null;
}

export function BrandFormModal({ open, onClose, brand }: BrandFormModalProps) {
  const isEdit = !!brand;
  const { createBrand, updateBrand } = useBrands();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: null,
    },
  });

  useEffect(() => {
    if (brand && open) {
      form.reset({
        name: brand.name,
        logo: brand.logo,
      });
    } else if (open) {
      form.reset({
        name: '',
        logo: null,
      });
    }
  }, [brand, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('name', values.name);
    if (values.logo instanceof File) {
      formData.append('logo', values.logo);
    }

    if (isEdit && brand) {
      updateBrand.mutate({ id: brand.id, data: formData }, { onSuccess: onClose });
    } else {
      createBrand.mutate(formData, { onSuccess: onClose });
    }
  };

  const isPending = createBrand.isPending || updateBrand.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Brand' : 'New Brand'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="flex justify-center">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload 
                        value={field.value} 
                        onChange={field.onChange} 
                        onClear={() => field.onChange(null)}
                        aspectRatio="1:1"
                        className="w-32 h-32 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bosch" className="text-xs font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={onClose} className="text-xs font-bold uppercase">Cancel</Button>
              <Button type="submit" disabled={isPending} className="text-xs font-bold uppercase bg-[#378ADD]">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Brand'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
