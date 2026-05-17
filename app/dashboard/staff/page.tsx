'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCog, Mail, Shield, Edit3, Loader2, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/api-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: staffData, isLoading } = useQuery<any[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      try {
        const response = await get<any>('/api/auth/staff/');
        // Handle both paginated and flat responses
        if (response.results !== undefined) {
           return response.results;
        } else if (response.data) {
           return response.data;
        }
        return response;
      } catch (e) {
        return [];
      }
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, isManager }: { id: number, isManager: boolean }) => {
      const role = isManager ? 'Manager' : 'Mechanic';
      return patch(`/api/auth/staff/${id}/`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff role updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update role')
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Management" 
        subtitle="Manage user roles, access levels and employee records"
        actions={
          <Button 
            className="h-9 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Staff Member
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center bg-white border rounded-xl">
            <Loader2 className="h-6 w-6 animate-spin text-[#378ADD]" />
          </div>
        ) : staffData?.map((member) => (
          <div key={member.id} className="rounded-xl bg-white border shadow-sm p-4 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#378ADD] border-2 border-white shadow-sm">
                    {member.name ? member.name.split(' ').map((n: string) => n[0]).join('') : 'ST'}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{member.name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{member.employee_id || 'No ID'}</span>
                </div>
              </div>
              <Badge variant="secondary" className={cn(
                "text-[9px] font-bold uppercase",
                member.is_manager || String(member.role).toLowerCase() === 'admin' 
                  ? "bg-purple-100 text-purple-700" 
                  : "bg-blue-100 text-blue-700"
              )}>
                {member.is_manager ? 'Manager' : (member.role || 'Mechanic')}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" /> {member.email || 'No email'}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  "text-[10px] font-bold uppercase",
                  member.is_active ? "text-green-600" : "text-red-500"
                )}>
                  {member.is_active ? 'Active Access' : 'Account Disabled'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-blue-50"
                onClick={() => updateRole.mutate({ id: member.id, isManager: !member.is_manager })}
                disabled={updateRole.isPending}
              >
                {updateRole.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Star className="h-3.5 w-3.5 mr-1.5" />}
                {member.is_manager ? 'Demote to Mechanic' : 'Promote to Manager'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && staffData?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border bg-white border-dashed">
          <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-bold text-foreground">No staff members found</p>
          <p className="text-xs text-muted-foreground mt-1">Start by adding your first administrative user.</p>
        </div>
      )}
    </div>
  );
}
