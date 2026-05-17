'use client';

import { usePlans, Plan } from '@/hooks/usePlans';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, ShieldAlert } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import { PlanFormModal } from './PlanFormModal';

export const PlansDataGrid = () => {
  const { data, isLoading, deletePlan } = usePlans();
  const [editingPlan, setEditingId] = useState<Plan | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const columns = [
    { 
      header: 'Plan Name', 
      accessor: (p: Plan) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold">{p.name}</span>
          <span className="text-[10px] text-muted-foreground">{p.tier} Tier</span>
        </div>
      ),
      width: '200px'
    },
    { 
      header: 'Price', 
      accessor: (p: Plan) => (
        <span className="text-xs font-bold text-[#378ADD]">
          {p.currency} {parseFloat(p.price).toLocaleString()}
        </span>
      ),
      width: '120px'
    },
    { 
      header: 'Billing', 
      accessor: (p: Plan) => (
        <span className="text-[10px] font-medium uppercase text-muted-foreground">{p.billing_period}</span>
      ),
      width: '120px'
    },
    { 
      header: 'Visits', 
      accessor: (p: Plan) => (
        <span className="text-xs font-medium">{p.included_visits || 'Unlimited'}</span>
      ),
      width: '100px'
    },
    { 
      header: 'Status', 
      accessor: (p: Plan) => (
        <StatusBadge status={p.active ? 'active' : 'inactive'} type="payment" />
      ),
      width: '100px'
    },
    { 
      header: 'Actions', 
      accessor: (p: Plan) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#378ADD]" onClick={() => setEditingId(p)}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeletingId(p.id)}>
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
      <DataTable 
        columns={columns} 
        data={data?.data} 
        isLoading={isLoading} 
        emptyMessage="No subscription plans found."
      />

      {editingPlan && (
        <PlanFormModal 
          open={!!editingPlan} 
          onOpenChange={(open) => !open && setEditingId(null)}
          initialData={editingPlan}
        />
      )}

      <ConfirmDialog 
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Plan?"
        description="This action cannot be undone. Any active subscriptions using this plan will remain valid until expiry."
        confirmLabel="Delete Plan"
        variant="danger"
        onConfirm={() => deletingId && deletePlan.mutate(deletingId, { onSuccess: () => setDeletingId(null) })}
      />
    </div>
  );
};
