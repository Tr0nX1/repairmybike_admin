'use client';

import { useServicePricing, ServicePricing } from '@/hooks/useServicePricing';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, IndianRupee, Bike, Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import { PricingFormModal } from './PricingFormModal';

export const PricingDataGrid = () => {
  const { data, isLoading, deletePricing } = useServicePricing();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<ServicePricing | null>(null);

  const handleEdit = (p: ServicePricing) => {
    setSelectedPricing(p);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPricing(null);
    setModalOpen(true);
  };

  const columns = [
    { 
      header: 'Service', 
      accessor: (p: ServicePricing) => (
        <span className="text-xs font-bold text-foreground">{p.service_name || `Service ID: ${p.service}`}</span>
      ),
      width: '200px'
    },
    { 
      header: 'Vehicle Model', 
      accessor: (p: ServicePricing) => (
        <div className="flex items-center gap-2">
          <Bike className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">{p.vehicle_model_name || `Model ID: ${p.vehicle_model}`}</span>
        </div>
      ),
      width: '200px'
    },
    { 
      header: 'Labor Rate', 
      accessor: (p: ServicePricing) => (
        <div className="flex items-center gap-1 text-xs font-bold text-[#378ADD]">
          <IndianRupee className="h-3 w-3" />
          {parseFloat(p.price).toLocaleString()}
        </div>
      ),
      width: '150px'
    },
    { 
      header: 'Actions', 
      accessor: (p: ServicePricing) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#378ADD]" onClick={() => handleEdit(p)}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeletingId(p.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      width: '100px',
      className: 'text-right px-4'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="h-8 text-[10px] font-bold uppercase bg-[#378ADD] gap-1.5" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" /> Add Pricing
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.data} 
        isLoading={isLoading} 
        emptyMessage="No labor rates defined."
      />

      <PricingFormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        pricing={selectedPricing} 
      />

      <ConfirmDialog 
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Pricing?"
        description="This will remove the specific labor rate for this service/vehicle combination."
        confirmLabel="Delete Rate"
        variant="danger"
        onConfirm={() => deletingId && deletePricing.mutate(deletingId, { onSuccess: () => setDeletingId(null) })}
      />
    </div>
  );
};
