'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/lib/query-client';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        {children}
      </AppShell>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
