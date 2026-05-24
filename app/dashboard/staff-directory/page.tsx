'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, PlusCircle, Pencil, Trash2, UserRound, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StaffDirectoryItem, StaffDirectoryFilters, useStaffDirectory } from '@/hooks/useStaffDirectory';

const roleOptions = ['Manager', 'Mechanic', 'Receptionist', 'Supervisor', 'Admin', 'Other'];

interface StaffFormState {
  identifier: string;
  name: string;
  employee_id: string;
  role: string;
  is_active: boolean;
  photo: File | null;
}

const emptyFormState: StaffFormState = {
  identifier: '',
  name: '',
  employee_id: '',
  role: 'Mechanic',
  is_active: true,
  photo: null,
};

export default function StaffDirectoryPage() {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffDirectoryFilters['role']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffDirectoryItem | null>(null);
  const [form, setForm] = useState<StaffFormState>(emptyFormState);

  const filters = useMemo(
    () => ({
      search: searchText,
      role: roleFilter,
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
    }),
    [searchText, roleFilter, statusFilter]
  );

  const { data: staff = [], isLoading, createStaff, updateStaff, deleteStaff } = useStaffDirectory(filters);

  const summary = useMemo(() => {
    const active = staff.filter((member) => member.is_active).length;
    const inactive = staff.length - active;

    return { active, inactive, total: staff.length };
  }, [staff]);

  const openCreateDialog = () => {
    setEditingStaff(null);
    setForm(emptyFormState);
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: StaffDirectoryItem) => {
    setEditingStaff(member);
    setForm({
      identifier: member.identifier,
      name: member.name || '',
      employee_id: member.employee_id || '',
      role: member.role || 'Other',
      is_active: member.is_active,
      photo: null,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStaff(null);
    setForm(emptyFormState);
  };

  const handleSubmit = async () => {
    if (!form.identifier.trim()) {
      toast.error('Identifier is required');
      return;
    }

    const payload = new FormData();
    payload.append('identifier', form.identifier.trim());
    payload.append('name', form.name.trim());
    payload.append('employee_id', form.employee_id.trim());
    payload.append('role', form.role || 'Other');
    payload.append('is_active', String(form.is_active));

    if (form.photo) {
      payload.append('photo', form.photo);
    }

    try {
      if (editingStaff) {
        await updateStaff.mutateAsync({ id: editingStaff.id, payload });
        toast.success(`${editingStaff.name || editingStaff.identifier} updated`);
      } else {
        await createStaff.mutateAsync(payload);
        toast.success('Staff directory entry created');
      }
      closeDialog();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save staff directory entry');
    }
  };

  const handleDelete = async (member: StaffDirectoryItem) => {
    if (!window.confirm(`Delete ${member.name || member.identifier}?`)) {
      return;
    }

    try {
      await deleteStaff.mutateAsync(member.id);
      toast.success(`${member.name || member.identifier} removed`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete staff entry');
    }
  };

  const columns = [
    {
      header: 'Staff',
      accessor: (member: StaffDirectoryItem) => (
        <div className="flex items-center gap-3 py-2">
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.name || member.identifier} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold">
              {member.name?.charAt(0) || member.identifier?.charAt(0) || 'S'}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{member.name || member.identifier}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{member.identifier}</span>
          </div>
        </div>
      ),
      width: '28%',
    },
    {
      header: 'Employee ID',
      accessor: (member: StaffDirectoryItem) => (
        <span className="text-sm text-slate-700">{member.employee_id || '—'}</span>
      ),
      width: '14%',
    },
    {
      header: 'Role',
      accessor: (member: StaffDirectoryItem) => (
        <span className="text-sm text-slate-700">{member.role || 'Other'}</span>
      ),
      width: '14%',
    },
    {
      header: 'Status',
      accessor: (member: StaffDirectoryItem) => (
        <Badge className={member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
          {member.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      width: '12%',
    },
    {
      header: 'Created',
      accessor: (member: StaffDirectoryItem) => (
        <span className="text-[11px] text-slate-500">{new Date(member.created_at).toLocaleDateString()}</span>
      ),
      width: '16%',
    },
    {
      header: 'Actions',
      accessor: (member: StaffDirectoryItem) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase text-[#378ADD]" onClick={() => openEditDialog(member)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase text-rose-600" onClick={() => handleDelete(member)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      ),
      width: '20%',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Directory"
        subtitle="Manage pre-provisioned staff accounts that can log into the admin panel"
        actions={
          <Button size="sm" className="h-9 text-[10px] font-bold uppercase gap-2" onClick={openCreateDialog}>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Staff
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Total Staff</p>
            <p className="mt-3 text-lg font-bold text-foreground">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Active</p>
            <p className="mt-3 text-lg font-bold text-foreground">{summary.active}</p>
          </CardContent>
        </Card>
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Inactive</p>
            <p className="mt-3 text-lg font-bold text-foreground">{summary.inactive}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by name, email, or employee ID"
              className="pl-9 text-xs"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</Label>
          <Select
            value={roleFilter || 'all'}
            onValueChange={(value) => setRoleFilter(value === null ? 'all' : value === 'all' ? 'all' : value)}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={staff}
          isLoading={isLoading}
          emptyMessage="No staff entries match your filters."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Directory Entry' : 'Add Staff Directory Entry'}</DialogTitle>
            <DialogDescription>
              {editingStaff
                ? 'Update the staff directory record and upload a new photo if needed.'
                : 'Create a pre-provisioned staff entry so the designated employee can sign in.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="identifier">Identifier</Label>
              <Input
                id="identifier"
                value={form.identifier}
                onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
                placeholder="Email or phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm((prev) => ({ ...prev, role: value || 'Other' }))}
              >
                <SelectTrigger id="role" size="sm" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={form.employee_id}
                onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="photo">Photo</Label>
              <div className="flex items-center gap-3 rounded-md border border-dashed p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <ImageIcon className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setForm((prev) => ({ ...prev, photo: event.target.files?.[0] || null }))}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Upload a photo for the directory profile if needed.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-lg border bg-slate-50 p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Active</p>
                <p className="text-[11px] text-slate-500">Set this staff entry as available for login.</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createStaff.isPending || updateStaff.isPending}>
              {(createStaff.isPending || updateStaff.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingStaff ? 'Save Changes' : 'Create Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
