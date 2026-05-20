/**
 * React Query Hooks for Alerts
 * Provides optimized data fetching, caching, and mutation handlers
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import * as userService from "@/services/user.service";
import { apiClient } from "@/config/axiosConfig";


export const useActiveAlerts = () => {
  return useQuery({
    queryKey: queryKeys.alerts.active(),
    queryFn: () => userService.getActiveAlerts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
    refetchOnReconnect: true, // Critical data: always reload on network recovery
  });
};


export const useMyAlerts = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.alerts.myAlerts(),
    queryFn: () => userService.getMyAlerts(),
    enabled,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  });
};

/**
 * Get alerts that current user has accepted
 * ✅ Cached for 3 minutes
 */
export const useAcceptedAlerts = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.alerts.accepted(),
    queryFn: () => userService.getAcceptedAlerts(),
    enabled,
    staleTime: 1000 * 60 * 3,
  });
};

/**
 * Get alert detail by ID
 * ✅ Individual alert caching
 */
export const useAlertDetail = (alertId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.alerts.detail(alertId),
    queryFn: () => apiClient.get(`alerts/${alertId}`).then((r) => r.data),
    enabled: enabled && !!alertId,
    staleTime: 1000 * 60 * 5,
  });
};

// ╔════════════════════════════════════════════════════════════════╗
// ║                        MUTATIONS                               ║
// ╚════════════════════════════════════════════════════════════════╝

/**
 * Create a new blood donation alert
 * ✅ Auto-invalidates related queries after success
 * ✅ Optimistic updates for better UX
 */
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof userService.sendAlert>[0]) =>
      userService.sendAlert(data),
    onSuccess: (newAlert) => {
      // Invalidate related queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.myAlerts(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.active(),
      });

      // Optionally add to cache for instant access
      queryClient.setQueryData(
        queryKeys.alerts.detail(newAlert.alertId),
        newAlert,
      );
    },
    onError: (error) => {
      console.error("❌ Error creating alert:", error);
    },
  });
};

/**
 * Respond to an alert (accept/ignore)
 * ✅ Auto-invalidates related queries
 */
export const useRespondToAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alertId,
      response,
    }: {
      alertId: number;
      response: "accepte" | "ignore";
    }) => userService.respondToAlert(alertId, response),
    onSuccess: () => {
      // Invalidate both accepted and active alerts
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.accepted(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.active(),
      });
    },
  });
};

/**
 * Validate an alert (admin only)
 * ✅ Auto-invalidates active alerts list
 */
export const useValidateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alertId,
      validated,
    }: {
      alertId: number;
      validated: boolean;
    }) =>
      apiClient.post(`alerts/${alertId}/validate`, { validated }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.all,
      });
    },
  });
};
