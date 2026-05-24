'use client';

import { useServices, Service } from '@/hooks/useServices';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, Star, Wrench } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import { ServiceFormModal } from './ServiceFormModal';
import { Badge } from '@/components/ui/badge';

export const ServiceDataGrid = () => {
  const { data, isLoading, deleteService } = useServices();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const columns = [
    { 
      header: 'Service Name', 
      accessor: (s: Service) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-50 text-[#378ADD]">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">{s.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">ID: {s.id}</span>
          </div>
        </div>
      ),
      width: '250px'
    },
    { 
      header: 'Category', 
      accessor: (s: Service) => (
        <span className="text-[10px] font-bold uppercase text-muted-foreground">{s.category_name ?? s.service_category}</span>
      ),
      width: '150px'
    },
    { 
      header: 'Featured', 
      accessor: (s: Service) => (
        s.is_featured ? (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[9px] uppercase font-bold gap-1">
            <Star className="h-2.5 w-2.5 fill-current" /> Featured
          </Badge>
        ) : null
      ),
      width: '120px'
    },
    { 
      header: 'Actions', 
      accessor: (s: Service) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#378ADD]" onClick={() => setEditingService(s)}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeletingId(s.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      width: '120px',
      className: 'text-right px-4'
    }
  ];

  return (
    <div className="space-y-4">
      <DataTable 
        columns={columns} 
        data={data?.data} 
        isLoading={isLoading} 
        emptyMessage="No services found in catalog."
      />

      {editingService && (
        <ServiceFormModal 
          open={!!editingService} 
          onOpenChange={(open) => !open && setEditingService(null)}
          initialData={editingService}
        />
      )}

      <ConfirmDialog 
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Service?"
        description="This will permanently remove this service from the catalog. Pricing associated with this service will also be impacted."
        confirmLabel="Delete Service"
        variant="danger"
        onConfirm={() => deletingId && deleteService.mutate(deletingId, { onSuccess: () => setDeletingId(null) })}
      />
    </div>
  );
};
