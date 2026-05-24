'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useParts, useCategories, useBrands } from '@/hooks/useParts';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit3, Trash2, Tag, Box, Award, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { StockBadge } from '@/components/ui/StockBadge';
import { CategoryFormModal } from '@/components/inventory/CategoryFormModal';
import { BrandFormModal } from '@/components/inventory/BrandFormModal';
import { NewPartForm } from '@/components/inventory/NewPartForm';
import { EditPartModal } from '@/components/inventory/EditPartModal';

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [newPartOpen, setNewPartOpen] = useState(false);
  const [editPart, setEditPart] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 400);
  
  const { data: parts, isLoading: partsLoading, deletePart } = useParts({ q: debouncedSearch });
  const { data: categories, isLoading: catsLoading, deleteCategory } = useCategories();
  const { data: brands, isLoading: brandsLoading, deleteBrand } = useBrands();

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'part' | 'cat' | 'brand', id: number | null }>({
    type: 'part',
    id: null
  });

  const [catModal, setCatModal] = useState<{ open: boolean, data: any | null }>({ open: false, data: null });
  const [brandModal, setBrandModal] = useState<{ open: boolean, data: any | null }>({ open: false, data: null });

  const partColumns = [
    { 
      header: 'Part Details', 
      accessor: (p: any) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 bg-slate-100 rounded border flex items-center justify-center overflow-hidden shrink-0">
            {p.thumbnail ? <img src={p.thumbnail} className="h-full w-full object-cover" /> : <Box className="h-5 w-5 text-slate-400" />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{p.sku}</span>
          </div>
        </div>
      ),
      width: '300px'
    },
    { 
      header: 'Category / Brand', 
      accessor: (p: any) => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-[9px] font-bold uppercase py-0 px-2 h-5 border-slate-200">{p.category_name}</Badge>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{p.brand_name}</span>
        </div>
      )
    },
    { 
      header: 'Stock', 
      accessor: (p: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-700">{p.stock_qty} Units</span>
          <StockBadge stock_qty={p.stock_qty} />
        </div>
      )
    },
    { 
      header: 'Price', 
      accessor: (p: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#378ADD]">₹{parseFloat(p.sale_price).toLocaleString()}</span>
          <span className="text-[9px] text-muted-foreground line-through decoration-slate-300">₹{parseFloat(p.mrp).toLocaleString()}</span>
        </div>
      )
    },
    { 
      header: 'Actions', 
      accessor: (p: any) => (
        <div className="flex justify-end gap-1 px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#378ADD]" onClick={() => setEditPart(p)}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteConfirm({type: 'part', id: p.id})}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      width: '100px',
      className: 'text-right'
    }
  ];

  const catColumns = [
    {
      header: 'Category',
      accessor: (c: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className="h-10 w-10 bg-slate-50 rounded border flex items-center justify-center overflow-hidden shrink-0">
             {c.image ? <img src={c.image.thumbnail || c.image} className="h-full w-full object-cover" /> : <Tag className="h-4 w-4 text-slate-300" />}
          </div>
          <span className="text-xs font-bold uppercase tracking-tight text-slate-800">{c.name}</span>
        </div>
      )
    },
    {
      header: 'Parts Count',
      accessor: (c: any) => <span className="text-xs font-bold text-slate-600">{c.part_count || 0} Products</span>
    },
    {
      header: 'Status',
      accessor: (c: any) => (
        <Badge variant={c.active ? 'default' : 'secondary'} className={`text-[9px] font-bold uppercase px-2 h-5 ${c.active ? 'bg-green-600' : ''}`}>
          {c.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (c: any) => (
        <div className="flex justify-end gap-1 px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#378ADD]" onClick={() => setCatModal({ open: true, data: c })}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteConfirm({type: 'cat', id: c.id})}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      width: '100px',
      className: 'text-right'
    }
  ];

  const brandColumns = [
    {
      header: 'Brand',
      accessor: (b: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className="h-10 w-10 bg-white rounded border flex items-center justify-center overflow-hidden p-1 shrink-0">
             {b.logo ? <img src={b.logo.thumbnail || b.logo} className="h-full w-full object-contain" /> : <Award className="h-4 w-4 text-slate-300" />}
          </div>
          <span className="text-xs font-bold uppercase tracking-tight text-slate-800">{b.name}</span>
        </div>
      )
    },
    {
      header: 'Parts Count',
      accessor: (b: any) => <span className="text-xs font-bold text-slate-600">{b.part_count || 0} Products</span>
    },
    {
      header: 'Actions',
      accessor: (b: any) => (
        <div className="flex justify-end gap-1 px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#378ADD]" onClick={() => setBrandModal({ open: true, data: b })}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteConfirm({type: 'brand', id: b.id})}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      width: '100px',
      className: 'text-right'
    }
  ];

  const handleDelete = () => {
    if (!deleteConfirm.id) return;
    if (deleteConfirm.type === 'part') {
      deletePart.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm({type: 'part', id: null}) });
    } else if (deleteConfirm.type === 'cat') {
      deleteCategory.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm({type: 'cat', id: null}) });
    } else if (deleteConfirm.type === 'brand') {
      deleteBrand.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm({type: 'brand', id: null}) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory" 
        subtitle="Manage spare parts, stock levels and catalog"
        actions={
          <Button className="h-9 text-xs font-bold uppercase tracking-widest gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3] shadow-sm" onClick={() => setNewPartOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Part
          </Button>
        }
      />

      <Tabs defaultValue="parts" className="w-full">
        <TabsList className="grid w-fit grid-cols-3 mb-6 bg-slate-100/50 p-1">
          <TabsTrigger value="parts" className="text-[10px] font-bold uppercase tracking-widest px-10">PARTS</TabsTrigger>
          <TabsTrigger value="categories" className="text-[10px] font-bold uppercase tracking-widest px-10">CATEGORIES</TabsTrigger>
          <TabsTrigger value="brands" className="text-[10px] font-bold uppercase tracking-widest px-10">BRANDS</TabsTrigger>
        </TabsList>

        <TabsContent value="parts" className="space-y-4 outline-none">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search parts by name or SKU..." 
              className="pl-10 h-10 text-xs bg-white shadow-sm border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={partColumns} 
              data={parts?.data} 
              isLoading={partsLoading} 
              emptyMessage="No spare parts found in inventory."
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 outline-none">
           <div className="flex justify-end">
              <Button size="sm" variant="outline" className="h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5 border-slate-200 bg-white" onClick={() => setCatModal({ open: true, data: null })}>
                <Plus className="h-3.5 w-3.5" /> New Category
              </Button>
           </div>
           <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={catColumns} 
              data={categories} 
              isLoading={catsLoading} 
              emptyMessage="No categories defined."
            />
          </div>
        </TabsContent>

        <TabsContent value="brands" className="space-y-4 outline-none">
           <div className="flex justify-end">
              <Button size="sm" variant="outline" className="h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5 border-slate-200 bg-white" onClick={() => setBrandModal({ open: true, data: null })}>
                <Plus className="h-3.5 w-3.5" /> New Brand
              </Button>
           </div>
           <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={brandColumns} 
              data={brands} 
              isLoading={brandsLoading} 
              emptyMessage="No brands defined."
            />
          </div>
        </TabsContent>
      </Tabs>

      <CategoryFormModal 
        open={catModal.open} 
        onClose={() => setCatModal({ open: false, data: null })} 
        category={catModal.data} 
      />

      <BrandFormModal 
        open={brandModal.open} 
        onClose={() => setBrandModal({ open: false, data: null })} 
        brand={brandModal.data} 
      />

      <NewPartForm 
        open={newPartOpen} 
        onOpenChange={setNewPartOpen} 
      />

      {editPart && (
        <EditPartModal
          open={!!editPart}
          part={editPart}
          onOpenChange={(open) => !open && setEditPart(null)}
        />
      )}

      <ConfirmDialog 
        open={!!deleteConfirm.id}
        onOpenChange={(open) => !open && setDeleteConfirm({type: 'part', id: null})}
        title={`Delete ${deleteConfirm.type === 'part' ? 'Part' : deleteConfirm.type === 'cat' ? 'Category' : 'Brand'}?`}
        description="This action cannot be undone. All associated data will be removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
