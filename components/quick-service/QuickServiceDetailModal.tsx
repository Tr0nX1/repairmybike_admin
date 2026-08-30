'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useQuickServiceRequestUpdate } from '@/hooks/useQuickService';
import { QuickServiceRequest, QuickServiceStatus } from '@/types/quick-service';
import { Phone, User, Bike, Clock, Loader2, Wrench, FileText, CheckCircle2 } from 'lucide-react';

interface QuickServiceDetailModalProps {
  request: QuickServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickServiceDetailModal = ({
  request,
  open,
  onOpenChange,
}: QuickServiceDetailModalProps) => {
  const updateMutation = useQuickServiceRequestUpdate();

  const [vehicleManufacturer, setVehicleManufacturer] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [status, setStatus] = useState<QuickServiceStatus>('initiated');
  const [staffNotes, setStaffNotes] = useState('');
  const [servicesGrabbed, setServicesGrabbed] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  useEffect(() => {
    if (request) {
      setVehicleManufacturer(request.vehicle_manufacturer || '');
      setVehicleModel(request.vehicle_model || '');
      setVehicleNumber(request.vehicle_number || '');
      setStatus(request.status || 'initiated');
      setStaffNotes(request.staff_notes || '');
      setServicesGrabbed(request.services_grabbed || '');
      setTotalAmount(request.total_amount ? String(request.total_amount) : '0.00');
    }
  }, [request]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: request.id,
        payload: {
          vehicle_manufacturer: vehicleManufacturer,
          vehicle_model: vehicleModel,
          vehicle_number: vehicleNumber,
          status,
          staff_notes: staffNotes,
          services_grabbed: servicesGrabbed,
          total_amount: totalAmount,
        },
      });
      onOpenChange(false);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const statusOptions: { value: QuickServiceStatus; label: string }[] = [
    { value: 'initiated', label: 'Initiated' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'mechanic_dispatched', label: 'Mechanic Dispatched' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const formattedDate = new Date(request.created_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-white border border-slate-200 p-6 rounded-xl shadow-xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#378ADD] uppercase tracking-wider">
                Quick Service #{request.id}
              </span>
              {request.guest_id ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none text-[10px] font-bold uppercase">
                  Guest
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none text-[10px] font-bold uppercase">
                  Account
                </Badge>
              )}
            </div>
            <StatusBadge status={request.status} type="quick_service" />
          </div>

          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-500" />
            {request.name}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500 flex items-center justify-between pt-1">
            <a 
              href={`tel:${request.phone_number}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#378ADD] hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {request.phone_number}
            </a>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* VEHICLE DETAILS SECTION */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Bike className="h-4 w-4 text-[#378ADD]" />
              Vehicle Information
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                  Manufacturer
                </label>
                <Input
                  value={vehicleManufacturer}
                  onChange={(e) => setVehicleManufacturer(e.target.value)}
                  placeholder="e.g. Honda"
                  className="h-9 text-xs bg-white border-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                  Model
                </label>
                <Input
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Activa 6G"
                  className="h-9 text-xs bg-white border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                Vehicle Plate Number
              </label>
              <Input
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. HR-26-AB-1234"
                className="h-9 text-xs font-mono font-semibold bg-white border-slate-200 uppercase"
              />
            </div>
          </div>

          {/* STATUS & AMOUNT SECTION */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuickServiceStatus)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                Total Amount ({"\u20B9"})
              </label>
              <Input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="h-9 text-xs font-bold text-[#378ADD] bg-white border-slate-200"
              />
            </div>
          </div>

          {/* SERVICES GRABBED / RENDERED */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5 text-slate-500" />
              Services Rendered / Grabbed
            </label>
            <Textarea
              value={servicesGrabbed}
              onChange={(e) => setServicesGrabbed(e.target.value)}
              placeholder="e.g. Engine Oil Change, Brake Pad Replacement, Spark Plug Clean"
              rows={2}
              className="text-xs bg-white border-slate-200"
            />
          </div>

          {/* STAFF NOTES */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              Internal Staff Notes
            </label>
            <Textarea
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Mechanic notes, dispatch timeline, customer instructions..."
              rows={3}
              className="text-xs bg-white border-slate-200"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="h-9 text-xs font-bold uppercase tracking-wider bg-[#378ADD] hover:bg-[#2D6FA3] text-white"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
