'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘/ or Ctrl+/ to focus search in current page (not implemented yet)
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header / TopBar */}
        <TopBar />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 pt-4">
          {children}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette />
    </div>
  );
};
