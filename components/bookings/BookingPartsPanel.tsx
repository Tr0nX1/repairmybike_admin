'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import { BookingPart } from '@/types/booking';
import { BOOKING_PART_APPROVAL_STATUS, type BookingStatus } from '@/types/enums';
import { isTerminalBookingStatus } from '@/lib/booking-transitions';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { PartSelector } from './PartSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type BookingPartsPanelProps = {
  bookingId: number;
  bookingStatus: BookingStatus;
  parts: BookingPart[];
};

const formatMoney = (value: string | number | undefined) => {
  const amount = Number(value || 0);
  return `INR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusClassName = (status?: string) => {
  switch (status) {
    case BOOKING_PART_APPROVAL_STATUS.APPROVED:
      return 'bg-green-100 text-green-700 border-green-200';
    case BOOKING_PART_APPROVAL_STATUS.REJECTED:
      return 'bg-red-50 text-red-700 border-red-100';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

export const BookingPartsPanel = ({ bookingId, bookingStatus, parts }: BookingPartsPanelProps) => {
  const [showAddPart, setShowAddPart] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const { approvePart, rejectPart, removePart } = useBookingDetail(bookingId);
  const isTerminal = isTerminalBookingStatus(bookingStatus);

  const summary = useMemo(() => {
    return parts.reduce(
      (acc, part) => {
        const status = part.approval_status || BOOKING_PART_APPROVAL_STATUS.PENDING;
        if (status === BOOKING_PART_APPROVAL_STATUS.APPROVED) acc.approved += 1;
        if (status === BOOKING_PART_APPROVAL_STATUS.PENDING) acc.pending += 1;
        if (status === BOOKING_PART_APPROVAL_STATUS.REJECTED) acc.rejected += 1;
        return acc;
      },
      { approved: 0, pending: 0, rejected: 0 }
    );
  }, [parts]);

  const handleActionError = (error: unknown) => {
    const code = (error as { code?: string }).code;
    if (code === 'BOOKING_TERMINAL') {
      toast.error('Completed or cancelled bookings cannot be changed');
      return;
    }
    if (code === 'ALREADY_APPROVED') {
      toast.error('This part is already approved');
      return;
    }
    if (code === 'ALREADY_REJECTED') {
      toast.error('This part is already rejected');
      return;
    }
    if (code === 'PART_NOT_PENDING') {
      toast.error('Only pending parts can be removed');
      return;
    }
    toast.error((error as Error).message || 'Part action failed');
  };

  const isMutating = approvePart.isPending || rejectPart.isPending || removePart.isPending;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spare Parts</h4>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {summary.approved} approved parts · {summary.pending} pending · {summary.rejected} rejected
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] gap-1 text-[#378ADD]"
          disabled={isTerminal}
          onClick={() => setShowAddPart((value) => !value)}
        >
          <Plus className="h-3 w-3" />
          Add Part
        </Button>
      </div>

      {showAddPart && !isTerminal && (
        <PartSelector bookingId={bookingId} onPartAdded={() => setShowAddPart(false)} />
      )}

      <div className="space-y-2">
        {parts.length === 0 ? (
          <div className="text-[10px] text-center py-4 text-muted-foreground bg-slate-50 rounded-md border border-dashed">
            No parts added yet
          </div>
        ) : (
          parts.map((part) => {
            const status = part.approval_status || BOOKING_PART_APPROVAL_STATUS.PENDING;
            const total = part.total_price || String(Number(part.unit_price) * part.quantity);
            const canApprove = !isTerminal && status !== BOOKING_PART_APPROVAL_STATUS.APPROVED;
            const canReject = !isTerminal && status !== BOOKING_PART_APPROVAL_STATUS.REJECTED;
            const canRemove = !isTerminal && status === BOOKING_PART_APPROVAL_STATUS.PENDING;

            return (
              <div key={part.id} className="rounded-md border bg-white p-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground">{part.part_name}</span>
                      <Badge variant="outline" className={cn('text-[9px] font-bold uppercase', statusClassName(status))}>
                        {status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      SKU: {part.sku || '-'} · Qty {part.quantity} · Locked {formatMoney(part.unit_price)} · Total {formatMoney(total)}
                    </p>
                  </div>
                  {isMutating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {canApprove && (
                    <Button
                      size="sm"
                      className="h-7 bg-green-600 px-2 text-[10px] font-bold uppercase text-white hover:bg-green-700"
                      disabled={approvePart.isPending}
                      onClick={() => approvePart.mutateAsync(part.id).catch(handleActionError)}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Approve
                    </Button>
                  )}
                  {canReject && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px] font-bold uppercase text-red-600 hover:text-red-700"
                      disabled={rejectPart.isPending}
                      onClick={() => rejectPart.mutateAsync(part.id).catch(handleActionError)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[10px] font-bold uppercase text-muted-foreground hover:text-red-600"
                    disabled={!canRemove || removePart.isPending}
                    onClick={() => setRemoveId(part.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={removeId !== null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Remove pending part"
        description="This removes the pending part from the booking and reduces the booking total. Approved or rejected parts must be rejected before removal."
        confirmLabel="Remove part"
        variant="danger"
        onConfirm={() => {
          if (removeId === null) return;
          removePart
            .mutateAsync(removeId)
            .then(() => setRemoveId(null))
            .catch(handleActionError);
        }}
      />
    </section>
  );
};
