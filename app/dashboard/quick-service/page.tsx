'use client';

import { useState } from 'react';
import { useQuickServiceRequests } from '@/hooks/useQuickService';
import { QuickServiceRequest, QuickServiceStatus } from '@/types/quick-service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QuickServiceDetailModal } from '@/components/quick-service/QuickServiceDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Phone, 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Bike, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  Wrench
} from 'lucide-react';

export default function QuickServicePage() {
  const [statusFilter, setStatusFilter] = useState<QuickServiceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuickServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuickServiceRequests({
    status: statusFilter,
    search: searchQuery,
  });

  const requests = data?.data || [];
  const totalCount = data?.count || 0;

  // Filter client-side for immediate responsive search experience
  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = req.name?.toLowerCase().includes(q);
    const phoneMatch = req.phone_number?.toLowerCase().includes(q);
    const vehicleMatch = 
      req.vehicle_number?.toLowerCase().includes(q) ||
      req.vehicle_manufacturer?.toLowerCase().includes(q) ||
      req.vehicle_model?.toLowerCase().includes(q);
    const statusMatch = req.status?.toLowerCase().includes(q);
    return nameMatch || phoneMatch || vehicleMatch || statusMatch;
  });

  // Calculate summary metrics
  const initiatedCount = requests.filter((r) => r.status === 'initiated').length;
  const contactedCount = requests.filter((r) => r.status === 'contacted').length;
  const dispatchedCount = requests.filter((r) => r.status === 'mechanic_dispatched' || r.status === 'in_progress').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  const handleOpenDetail = (req: QuickServiceRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const statusOptions: { value: QuickServiceStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'initiated', label: 'Initiated' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'mechanic_dispatched', label: 'Mechanic Dispatched' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Zap className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quick Service Requests
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage fast-track emergency dispatches, guest bookings, and instant mechanic calls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 text-xs font-semibold"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Requests</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#378ADD] flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Initiated / Contacted</p>
            <p className="text-2xl font-black text-amber-700 mt-0.5">{initiatedCount + contactedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock3 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Dispatched / Active</p>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{dispatchedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Wrench className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#EAF3DE]/30 p-4 rounded-xl border border-[#EAF3DE] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Completed</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{completedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, vehicle..."
            className="pl-9 h-9 text-xs border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QuickServiceStatus | 'all')}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-[#378ADD]" />
            Loading Quick Service requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">No Quick Service requests found.</p>
            <p className="text-slate-400">Try adjusting your status filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Vehicle Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRequests.map((req) => {
                  const formattedDate = new Date(req.created_at).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  const vehicleDisplay = [
                    req.vehicle_manufacturer,
                    req.vehicle_model,
                    req.vehicle_number ? `(${req.vehicle_number})` : null,
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#378ADD]">
                        #{req.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {req.name}
                            {req.guest_id ? (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none text-[9px] font-bold uppercase py-0 px-1.5">
                                Guest
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none text-[9px] font-bold uppercase py-0 px-1.5">
                                Account
                              </Badge>
                            )}
                          </div>
                          <a
                            href={`tel:${req.phone_number}`}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-[#378ADD] hover:underline text-[11px]"
                          >
                            <Phone className="h-3 w-3 text-slate-400" />
                            {req.phone_number}
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Bike className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {vehicleDisplay || <span className="text-slate-300 italic">Not provided</span>}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} type="quick_service" />
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {"\u20B9"}{Number(req.total_amount || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(req)}
                          className="h-8 text-xs font-semibold text-[#378ADD] hover:bg-blue-50"
                        >
                          <Edit3 className="mr-1 h-3.5 w-3.5" />
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL / UPDATE MODAL */}
      <QuickServiceDetailModal
        request={selectedRequest}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
