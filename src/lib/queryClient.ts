import { QueryClient } from '@tanstack/react-query';

// One client for the whole app. Every screen reads through it, which is what
// lets a log on one tab show up on the others without a reload.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is the user's own and changes only through this app, so a short
      // stale window avoids refetch storms when switching tabs.
      staleTime: 30_000,
      retry: 2,
    },
  },
});
