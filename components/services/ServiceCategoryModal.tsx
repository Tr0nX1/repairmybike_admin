'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Edit3, Trash2, Tag, ArrowLeft } from 'lucide-react';
import { useServiceCategories, ServiceCategory } from '@/hooks/useServiceCategories';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ServiceCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceCategoryModal({ open, onOpenChange }: ServiceCategoryModalProps) {
  const { data: categories, isLoading, createCategory, updateCategory, deleteCategory } = useServiceCategories();
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setImage(null);
    setEditingCategory(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setView('form');
  };

  const handleStartEdit = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image?.thumbnail || null);
    setView('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (image instanceof File) {
      formData.append('image', image);
    }

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data: formData }, {
        onSuccess: () => {
          setView('list');
          resetForm();
        }
      });
    } else {
      createCategory.mutate(formData, {
        onSuccess: () => {
          setView('list');
          resetForm();
        }
      });
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setView('list'); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              {view === 'form' && (
                <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600">
                  <ArrowLeft size={16} />
                </button>
              )}
              {view === 'list' ? 'Manage Service Categories' : editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          {view === 'list' ? (
            <div className="flex-1 flex flex-col min-h-[300px]">
              <div className="p-6 pt-2 pb-4 flex justify-between items-center border-b">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Categories: {categories?.length || 0}</span>
                <Button size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider bg-[#378ADD] gap-1.5" onClick={handleStartAdd}>
                  <Plus className="h-3 w-3" /> New Category
                </Button>
              </div>

              <div className="flex-1 divide-y overflow-y-auto px-6 max-h-[450px]">
                {isLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                ) : categories?.length === 0 ? (
                  <p className="py-12 text-center text-xs text-muted-foreground italic">No service categories defined.</p>
                ) : (
                  categories?.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-50 border rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                          {cat.image ? (
                            <img src={cat.image.thumbnail} className="h-full w-full object-cover" alt={cat.name} />
                          ) : (
                            <Tag size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground">{cat.service_count || 0} Services</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => handleStartEdit(cat)}>
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => setCategoryToDelete(cat)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="w-24 h-24">
                  <ImageUpload 
                    value={image} 
                    onChange={setImage} 
                    onClear={() => setImage(null)}
                    aspectRatio="1:1"
                    className="w-full h-full rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Category Name</label>
                <Input 
                  required 
                  placeholder="e.g. Periodic Services" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="h-10 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</label>
                <Textarea 
                  placeholder="Describe what services belong in this category..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="text-xs min-h-[80px]"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setView('list')} className="text-xs font-bold uppercase">Back</Button>
                <Button type="submit" disabled={isPending} className="text-xs font-bold uppercase bg-[#378ADD]">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!categoryToDelete}
        onOpenChange={(v) => !v && setCategoryToDelete(null)}
        title="Delete Category?"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? All services inside this category will need to be reclassified.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory.mutate(categoryToDelete.id, {
              onSuccess: () => setCategoryToDelete(null)
            });
          }
        }}
      />
    </>
  );
}
