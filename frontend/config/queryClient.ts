import { QueryClient } from "@tanstack/react-query";

/**
 * Configure QueryClient with optimized cache and performance settings
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes - prevents unnecessary API calls
        staleTime: 1000 * 60 * 5,
        // Keep data in memory for 10 minutes even if unused
        gcTime: 1000 * 60 * 10,
        // Don't refetch when window regains focus (mobile doesn't have this concept)
        refetchOnWindowFocus: false,
        // Don't refetch when component remounts if data is fresh
        refetchOnMount: false,
        // Don't refetch on reconnect (manual control better for mobile)
        refetchOnReconnect: false,
        // Retry failed requests 2 times with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 10 second timeout
        networkMode: "always",
      },
      mutations: {
        // Retry mutations max 1 time (user actions should not auto-retry)
        retry: 1,
        // 10 second timeout
        networkMode: "always",
      },
    },
  });

export const queryClient = createQueryClient();
