import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import { theme } from '@/app/theme/theme';
import { routeTree } from '@/routeTree.gen';
import { useAutoUpdatePWA } from '@/shared/hooks/useAutoUpdatePWA';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      networkMode: 'always',
    },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function Providers() {
  useAutoUpdatePWA();

  React.useEffect(() => {
    try {
      const channel = new BroadcastChannel('careta-db');
      channel.onmessage = (event: MessageEvent<{ tables?: string[] }>) => {
        const tables = event.data?.tables || [];
        if (tables.includes('vehicle')) {
          queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        }
        if (tables.includes('entries')) {
          queryClient.invalidateQueries({ queryKey: ['entries'] });
        }
        if (tables.includes('notes')) {
          queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
        if (tables.includes('reminders')) {
          queryClient.invalidateQueries({ queryKey: ['reminders'] });
        }
      };
      return () => channel.close();
    } catch {
      // BroadcastChannel not available in environment
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
