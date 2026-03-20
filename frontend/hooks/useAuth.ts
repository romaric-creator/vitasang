/**
 * React Query Hooks for Authentication
 * Handles login, registration, and user profile management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import * as userService from "@/services/user.service";
import { storeData, removeData } from "@/utils/storage";
import { apiClient } from "@/config/axiosConfig";

// ╔════════════════════════════════════════════════════════════════╗
// ║                        MUTATIONS                               ║
// ╚════════════════════════════════════════════════════════════════╝

/**
 * Login user
 * ✅ Sets user in cache after successful login
 * ✅ Stores token and user data
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      telephone,
      mot_de_passe,
    }: {
      telephone: string;
      mot_de_passe: string;
    }) => userService.loginUser(telephone, mot_de_passe),

    onSuccess: async (data) => {
      // Store token and user
      await storeData("token", data.token);
      await storeData("user", JSON.stringify(data.user));

      // Set in cache for instant access
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Refetch active alerts now that user is logged in
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.active(),
      });
    },
  });
};

/**
 * Register new user
 * ✅ Auto-login after registration
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: {
      nom: string;
      prenom: string;
      telephone: string;
      mot_de_passe: string;
      groupe_sanguin: string;
      role: string;
      code_parrainage?: string;
    }) =>
      userService.registerUser(
        userData.nom,
        userData.prenom,
        userData.telephone,
        userData.mot_de_passe,
        userData.groupe_sanguin,
        userData.role,
        userData.code_parrainage,
      ),

    onSuccess: async (data) => {
      // Store token and user
      await storeData("token", data.token);
      await storeData("user", JSON.stringify(data.user));

      // Set in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Clear pending alert if exists
      await removeData("pending_alert");

      // Invalidate to refetch with new user context
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.all,
      });
    },
  });
};

/**
 * Logout user
 * ✅ Clears all user data from cache
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await removeData("token");
      await removeData("user");
    },

    onSuccess: () => {
      // Clear all user-specific data from cache
      queryClient.removeQueries({
        queryKey: queryKeys.auth.user(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.alerts.myAlerts(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.notifications.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.active(),
      });
    },
  });
};

/**
 * Update user profile
 * ✅ Auto-refetch user data after update
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: any) =>
      apiClient
        .put(
          `/users/${profileData.id_utilisateur || profileData.id}`,
          profileData,
        )
        .then((r) => r.data),

    onSuccess: (updatedUser) => {
      // Update cache
      queryClient.setQueryData(queryKeys.auth.user(), updatedUser);
    },
  });
};

// ╔════════════════════════════════════════════════════════════════╗
// ║                         QUERIES                                ║
// ╚════════════════════════════════════════════════════════════════╝

/**
 * Get current user profile
 * ✅ Conditional query - only runs if user is authenticated
 */
export const useCurrentUser = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      // For now, return null - actual user is set during login/register
      // In production, could fetch from /api/users/me endpoint
      return null;
    },
    enabled: false, // Disabled - user is set directly on login/register
  });
};

/**
 * Get user profile by ID
 * ✅ Caches individual user profiles
 */
export const useUserProfile = (userId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () =>
      apiClient.get(`/users/${userId}/profile`).then((r) => r.data),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes for static profiles
  });
};
