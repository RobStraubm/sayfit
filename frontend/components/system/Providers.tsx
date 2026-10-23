"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/app.store";
import { errorMessage } from "@/lib/utils";
import { NotificationCenter } from "./NotificationCenter";

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (err, query) => {
        const fallback = query.meta?.errorMessage;
        if (!fallback) return;
        const { addNotification } = useAppStore.getState();
        addNotification({
          type: "error",
          message: errorMessage(err, fallback),
        });
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <NotificationCenter />
    </QueryClientProvider>
  );
}
