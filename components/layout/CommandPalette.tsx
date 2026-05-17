'use client';

import { useEffect, useState } from 'react';
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  Smile, 
  User,
  Search,
  LayoutDashboard,
  CalendarCheck,
  Banknote,
  Package,
  ShoppingCart
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useUIStore } from '@/store/ui.store';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = (command: () => void) => {
    setCommandPaletteOpen(false);
    command();
  };

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border-none max-w-2xl">
        <Command className="rounded-lg border-none shadow-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Search bookings, customers or actions..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="QUICK NAV">
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                <LayoutDashboard className="mr-2" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/bookings'))}>
                <CalendarCheck className="mr-2" />
                <span>Bookings</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/cash'))}>
                <Banknote className="mr-2" />
                <span>Cash Reconciliation</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/inventory'))}>
                <Package className="mr-2" />
                <span>Inventory</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/orders'))}>
                <ShoppingCart className="mr-2" />
                <span>Orders</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="RECENT BOOKINGS">
              {/* Mock recent bookings for now */}
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/bookings/1'))}>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">#1024 - John Doe</span>
                  <span className="text-[10px] text-muted-foreground">Splendor Plus • Pending</span>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/bookings/2'))}>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">#1023 - Jane Smith</span>
                  <span className="text-[10px] text-muted-foreground">Activa 6G • Completed</span>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="ACTIONS">
              <CommandItem onSelect={() => runCommand(() => console.log('New Booking'))}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>New Booking</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => console.log('Export'))}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Export Data</span>
                <CommandShortcut>⌘E</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
