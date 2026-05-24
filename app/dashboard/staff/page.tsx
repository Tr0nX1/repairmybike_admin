'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Search, Loader2, User, Shield, Edit3, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/api';
import { useUsers, UserListItem, UserRoleFilters, RoleUpdatePayload } from '@/hooks/useUsers';

interface RoleFormState {
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_manager: boolean;
}

export default function StaffPage() {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilters['role']>('all');
  const [statusFilter, setStatusFilter] = useState<UserRoleFilters['status']>('all');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState<RoleFormState>({
    is_active: false,
    is_staff: false,
    is_superuser: false,
    is_manager: false,
  });

  const { data: currentUserResponse } = useQuery<UserListItem>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await get<ApiResponse<UserListItem>>('/api/auth/profile/');
      return response.data;
    },
  });

  const currentUser = currentUserResponse;
  const isSuperuser = Boolean(currentUser?.is_superuser);
  const isManager = Boolean(currentUser?.is_manager);
  const canEditManager = isSuperuser || isManager;
  const canEditActive = isSuperuser || isManager;

  const filters: UserRoleFilters = useMemo(
    () => ({ search: searchText, role: roleFilter, status: statusFilter }),
    [searchText, roleFilter, statusFilter]
  );

  const { data: usersResponse, isLoading, updateUserRoles } = useUsers(filters);
  const users = usersResponse ?? [];

  const openEditModal = (user: UserListItem) => {
    setSelectedUser(user);
    setRoleForm({
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      is_manager: user.is_manager,
    });
    setIsModalOpen(true);
  };

  const isEditingSelf = selectedUser?.id === currentUser?.id;
  const canEditStaff = isSuperuser;
  const canEditSuperuser = isSuperuser && !!selectedUser && !isEditingSelf;

  const handleSaveRoles = async () => {
    if (!selectedUser) {
      return;
    }

    const payload: RoleUpdatePayload = {
      is_active: roleForm.is_active,
      is_manager: roleForm.is_manager,
    };

    if (canEditStaff) {
      payload.is_staff = roleForm.is_staff;
    }
    if (canEditSuperuser) {
      payload.is_superuser = roleForm.is_superuser;
    }

    updateUserRoles.mutate(
      { id: selectedUser.id, roles: payload },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success(`Roles updated for ${selectedUser.username}`);
        },
        onError: (err: any) => {
          if (err?.code === 'SUPERUSER_REQUIRED') {
            toast.error('Only superusers can change staff or superuser roles');
            return;
          }
          if (err?.code === 'SELF_DEMOTION') {
            toast.error('You cannot remove your own superuser access');
            return;
          }
          toast.error(err?.message || 'Failed to update roles');
        },
      }
    );
  };

  const columns = [
    {
      header: 'User',
      accessor: (user: UserListItem) => (
        <div className="flex items-center gap-3 py-2">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">
            {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">{user.full_name || user.username}</span>
            <span className="text-[10px] text-muted-foreground">{user.email || 'No email'}</span>
          </div>
        </div>
      ),
      width: '33%',
    },
    {
      header: 'Phone',
      accessor: (user: UserListItem) => (
        <span className="text-xs text-slate-700">{user.phone_number || '—'}</span>
      ),
      width: '18%',
    },
    {
      header: 'Roles',
      accessor: (user: UserListItem) => (
        <RoleBadge
          is_active={user.is_active}
          is_staff={user.is_staff}
          is_superuser={user.is_superuser}
          is_manager={user.is_manager}
        />
      ),
      width: '25%',
    },
    {
      header: 'Joined',
      accessor: (user: UserListItem) => (
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      ),
      width: '14%',
    },
    {
      header: 'Actions',
      accessor: (user: UserListItem) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-blue-50"
          onClick={() => openEditModal(user)}
        >
          <Edit3 className="h-3.5 w-3.5 mr-1" />
          Edit Roles
        </Button>
      ),
      width: '150px',
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage access and administrative roles for all application users"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search by username, email or phone"
                  className="pl-9 text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Role Filter</Label>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRoleFilters['role'])}>
                <SelectTrigger size="sm" className="w-full" aria-label="Role filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                  <SelectItem value="superuser">Superusers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status Filter</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserRoleFilters['status'])}>
                <SelectTrigger size="sm" className="w-full" aria-label="Status filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] font-bold uppercase"
            onClick={() => {
              setSearchText('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <DataTable columns={columns} data={users} isLoading={isLoading} emptyMessage="No users match your filters." />
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              Update access levels and administrative roles for the selected user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Username</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedUser?.username || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Email</p>
                <p className="mt-2 text-sm text-slate-700">{selectedUser?.email || '—'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Role Set</span>
                  <RoleBadge
                    is_active={selectedUser?.is_active ?? false}
                    is_staff={selectedUser?.is_staff ?? false}
                    is_superuser={selectedUser?.is_superuser ?? false}
                    is_manager={selectedUser?.is_manager ?? false}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active</p>
                      <p className="text-[11px] text-slate-600">Enable or disable the account.</p>
                    </div>
                    <Switch
                      checked={roleForm.is_active}
                      onCheckedChange={(checked) => setRoleForm((prev) => ({ ...prev, is_active: checked }))}
                      disabled={!canEditActive}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Manager</p>
                      <p className="text-[11px] text-slate-600">Grant or revoke manager-level access.</p>
                    </div>
                    <Switch
                      checked={roleForm.is_manager}
                      onCheckedChange={(checked) => setRoleForm((prev) => ({ ...prev, is_manager: checked }))}
                      disabled={!canEditManager}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Staff</p>
                      <p className="text-[11px] text-slate-600">Staff access is limited to operational tools.</p>
                    </div>
                    <Switch
                      checked={roleForm.is_staff}
                      onCheckedChange={(checked) => setRoleForm((prev) => ({ ...prev, is_staff: checked }))}
                      disabled={!canEditStaff}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Superuser</p>
                      <p className="text-[11px] text-slate-600">Allows full admin privileges.</p>
                    </div>
                    <Switch
                      checked={roleForm.is_superuser}
                      onCheckedChange={(checked) => setRoleForm((prev) => ({ ...prev, is_superuser: checked }))}
                      disabled={!canEditSuperuser}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isEditingSelf ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-semibold">You cannot remove your own superuser access.</p>
                  <p className="text-[11px] text-slate-600">Your superuser privilege is protected while editing your own account.</p>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-9 text-xs font-bold uppercase">
              Cancel
            </Button>
            <Button
              className="h-9 text-xs font-bold uppercase"
              onClick={handleSaveRoles}
              disabled={updateUserRoles.isPending || !selectedUser}
            >
              {updateUserRoles.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Role Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
