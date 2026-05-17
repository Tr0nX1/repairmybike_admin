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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useParts';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  active: z.boolean(),
  image: z.any().optional(),
});

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: any | null;
}

export function CategoryFormModal({ open, onClose, category }: CategoryFormModalProps) {
  const isEdit = !!category;
  const { createCategory, updateCategory } = useCategories();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      active: true,
      image: null,
    },
  });

  useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name,
        active: category.active,
        image: category.image,
      });
    } else if (open) {
      form.reset({
        name: '',
        active: true,
        image: null,
      });
    }
  }, [category, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('active', String(values.active));
    if (values.image instanceof File) {
      formData.append('image', values.image);
    }

    if (isEdit && category) {
      updateCategory.mutate({ id: category.id, data: formData }, { onSuccess: onClose });
    } else {
      createCategory.mutate(formData, { onSuccess: onClose });
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="flex justify-center">
              <FormField
                control={form.control}
                name="image"
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
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Engine Parts" className="text-xs font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-slate-50/50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-bold">Active Status</FormLabel>
                    <p className="text-[10px] text-muted-foreground font-medium">Toggle visibility in catalog</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={onClose} className="text-xs font-bold uppercase">Cancel</Button>
              <Button type="submit" disabled={isPending} className="text-xs font-bold uppercase bg-[#378ADD]">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
