import { QueryClient } from "@tanstack/react-query";

/**
 * Configure QueryClient avec caching optimisé et types de données différents
 * - Critical : 30s (alertes, stock sanguin)
 * - Short : 1-5 min (profil utilisateur, données temporelles)
 * - Medium : 5-15 min (centres, rendez-vous)
 * - Long : 24h (données de référence)
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes - prevents unnecessary API calls
        staleTime: 1000 * 60 * 5,
        // Keep data in memory for 24 hours even if unused (Offline First)
        gcTime: 1000 * 60 * 60 * 24,
        // Don't refetch when window regains focus (mobile doesn't have this concept)
        refetchOnWindowFocus: false,
        // Don't refetch when component remounts if data is fresh
        refetchOnMount: false,
        // Refetch on reconnect to reload fresh data after network recovery
        refetchOnReconnect: true,
        // Retry failed requests 1 time with exponential backoff
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Always try network (not just online)
        networkMode: "always",
      },
      mutations: {
        // Retry mutations max 1 time (user actions should not auto-retry)
        retry: 1,
        // Always try network
        networkMode: "always",
      },
    },
  });

export const queryClient = createQueryClient();
