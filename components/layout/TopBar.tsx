'use client';

import { usePathname } from 'next/navigation';
import { Search, RefreshCw, AlertCircle, User, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export const TopBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const { user, clearAuth } = useAuthStore();
  
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    setSecondsAgo(0);
    toast.info('Data refreshed');
  };

  const getPageTitle = () => {
    const segment = pathname.split('/').pop() || 'Dashboard';
    if (segment === 'dashboard') return 'Overview';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!mounted) return (
    <header className="flex h-12 items-center justify-between border-b bg-white px-4 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admin</span>
      </div>
    </header>
  );

  return (
    <header className="flex h-12 items-center justify-between border-b bg-white px-4 shrink-0 z-10">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admin</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-xs font-bold text-foreground">{getPageTitle()}</span>
      </div>

      {/* Global Search */}
      <div className="relative w-full max-w-md mx-4">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search bookings, customers... ⌘K"
          className="h-8 w-full bg-slate-50 pl-9 text-[11px] font-medium focus:bg-white transition-all cursor-pointer border-transparent hover:border-slate-200"
          onClick={() => setCommandPaletteOpen(true)}
          readOnly
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Refresh Badge */}
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 hover:bg-slate-100 transition-colors group"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse group-hover:hidden" />
          <RefreshCw className="h-3 w-3 text-green-600 hidden group-hover:block animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Refreshed {secondsAgo}s ago</span>
        </button>

        {/* Low Stock Alert */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:bg-red-50 hover:text-red-600">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center bg-red-500 p-0 text-[8px] font-bold text-white border-2 border-white">
            3
          </Badge>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            "h-8 w-8 rounded-full bg-slate-100 p-0 border border-transparent hover:border-slate-200 cursor-pointer overflow-hidden"
          )}>
            <div className="h-full w-full bg-[#378ADD] flex items-center justify-center text-[10px] font-bold text-white">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel className="p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{user?.email}</span>
                <Badge variant="secondary" className="w-fit mt-1.5 text-[8px] font-bold uppercase py-0 px-1 bg-blue-50 text-[#378ADD]">{user?.role}</Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs font-medium py-2">
              <User className="h-3.5 w-3.5 mr-2" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-medium py-2">
              <AlertCircle className="h-3.5 w-3.5 mr-2" /> Help Center
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs font-bold py-2 text-red-500 focus:bg-red-50 focus:text-red-600" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
