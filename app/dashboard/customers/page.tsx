'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCustomers } from '@/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Eye, User, Phone, Calendar, Mail } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CustomerDetailPanel } from '@/components/customers/CustomerDetailPanel';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data: customers, isLoading } = useCustomers(debouncedSearch);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Customers" 
        subtitle="Manage customer relationships and view history"
      />

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email or phone..." 
          className="pl-9 h-10 text-xs bg-white shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/50">
              <TableHead className="text-[10px] font-bold uppercase py-3">Customer</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Contact</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Stats</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Last Visit</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-right px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                </TableCell>
              </TableRow>
            ) : !customers || customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <User className="h-10 w-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No customers found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-slate-50 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-[#378ADD]">
                        {customer.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{customer.full_name}</span>
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Joined {formatDate(customer.created_at)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Phone className="h-2.5 w-2.5" /> {customer.phone_number}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Mail className="h-2.5 w-2.5" /> {customer.email || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{customer.total_bookings} Bookings</span>
                      <span className="text-[9px] text-muted-foreground font-bold">LTV: ₹{customer.total_ltv}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {customer.last_visit ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-slate-600">{customer.last_visit}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] font-bold uppercase text-[#378ADD] gap-1.5 hover:bg-blue-50"
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
        <SheetContent className="sm:max-w-2xl p-0 overflow-y-auto border-l-0 shadow-2xl">
          {selectedCustomerId && (
            <CustomerDetailPanel 
              id={selectedCustomerId} 
              onClose={() => setSelectedCustomerId(null)} 
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
