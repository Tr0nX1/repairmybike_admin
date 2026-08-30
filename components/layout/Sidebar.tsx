'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Banknote, 
  Package, 
  ShoppingCart, 
  Users, 
  UserCog, 
  History, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
  Wrench,
  BarChart2,
  Bell,
  Globe,
  Bike,
  MessageSquare,
  PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookingStats } from '@/hooks/useBookingStats';

import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
  hidden?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, clearAuth } = useAuthStore();
  const { isAdmin, can } = usePermissions();
  const { data: stats } = useBookingStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navGroups: NavGroup[] = [
    {
      label: 'OPERATIONS',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Bookings', 
          href: '/dashboard/bookings', 
          icon: CalendarCheck,
          badge: stats?.booking_status?.pending,
          badgeColor: 'bg-amber-100 text-amber-700'
        },
        { label: 'Quick Service', href: '/dashboard/quick-service', icon: PhoneCall },
        { label: 'Cash', href: '/dashboard/cash', icon: Banknote },
        { label: 'Payments', href: '/dashboard/payments', icon: Banknote },
        { label: 'Reports', href: '/dashboard/reports', icon: BarChart2 },
        { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: Zap },
      ]
    },
    {
      label: 'CATALOG',
      items: [
        { label: 'Vehicles', href: '/dashboard/vehicles', icon: Bike },
        { 
          label: 'Inventory', 
          href: '/dashboard/inventory', 
          icon: Package,
          badge: 0,
          badgeColor: 'bg-red-100 text-red-700'
        },
        { label: 'Services', href: '/dashboard/services', icon: Wrench },
        { label: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
      ]
    },
    {
      label: 'PEOPLE',
      items: [
        { label: 'Customers', href: '/dashboard/customers', icon: Users },
        { label: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
        { 
          label: 'Staff', 
          href: '/dashboard/staff', 
          icon: UserCog,
          hidden: !can('manage:staff')
        },
        {
          label: 'Staff Directory',
          href: '/dashboard/staff-directory',
          icon: Users,
          hidden: !can('manage:staff')
        },
      ]
    },
    {
      label: 'ADMIN',
      items: [
        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { label: 'CMS', href: '/dashboard/content', icon: Globe },
        { 
          label: 'Logs', 
          href: '/dashboard/logs', 
          icon: History,
          hidden: !can('view:logs')
        },
        { 
          label: 'Settings', 
          href: '/dashboard/settings', 
          icon: Settings,
          hidden: !can('view:settings')
        },
      ]
    }
  ];

  if (!mounted) return (
    <aside className={cn(
      "flex flex-col border-r bg-white transition-all duration-300",
      sidebarCollapsed ? "w-[60px]" : "w-[220px]"
    )}>
      <div className="flex h-12 items-center border-b px-4">
        {!sidebarCollapsed && <span className="text-sm font-bold tracking-tight text-[#378ADD]">RepairMyBike</span>}
      </div>
    </aside>
  );


  return (
    <aside className={cn(
      "flex flex-col border-r bg-white transition-all duration-300",
      sidebarCollapsed ? "w-[60px]" : "w-[220px]"
    )}>
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <span className="text-sm font-bold tracking-tight text-[#378ADD]">RepairMyBike</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="h-8 w-8 text-muted-foreground"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4 px-2">
            {!sidebarCollapsed && (
              <h3 className="mb-2 px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.filter(item => !item.hidden).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isActive 
                        ? "bg-white border-l-2 border-[#378ADD] text-foreground font-medium" 
                        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex flex-1 items-center justify-between">
                        <span>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="secondary" className={cn("px-1.5 py-0 text-[10px]", item.badgeColor)}>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="border-t p-2">
        <div className={cn(
          "flex items-center gap-3 rounded-md p-2",
          !sidebarCollapsed && "hover:bg-slate-50"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#378ADD] text-[10px] font-medium text-white">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-foreground">{user?.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{user?.role}</span>
            </div>
          )}
          {!sidebarCollapsed && (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-muted-foreground hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};
