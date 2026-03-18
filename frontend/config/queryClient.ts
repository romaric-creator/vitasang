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
