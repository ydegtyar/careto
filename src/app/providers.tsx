import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import { theme } from '@/app/theme/theme';
import { routeTree } from '@/routeTree.gen';
import { useAutoUpdatePWA } from '@/shared/hooks/useAutoUpdatePWA';
import { CACHE_KEY, customAsyncStorage } from '@/shared/lib/queryPersister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      networkMode: 'always',
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const asyncPersister = createAsyncStoragePersister({
  storage: customAsyncStorage,
  key: CACHE_KEY,
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
      const channel = new BroadcastChannel('careto-db');
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncPersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
