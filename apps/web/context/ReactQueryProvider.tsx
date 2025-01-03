"use client";

import React, { ReactNode } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query';

const createQueryClient = (() => {
  let client: QueryClient | null = null;
  let storePersister: any = null;

  return () => {
    if (!client) {
      client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60,
            gcTime: 1000 * 60 * 60 * 24,
            refetchOnWindowFocus: false,
            refetchOnMount: false
          },
        },
      });

      if (typeof window !== 'undefined') {
        storePersister = createSyncStoragePersister({
          storage: window.localStorage
        });
      }
    }
    return { client, persister: storePersister };
  };
})();

interface ReactQueryProviderProps {
  children: ReactNode;
}

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  const { client, persister } = createQueryClient();

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
