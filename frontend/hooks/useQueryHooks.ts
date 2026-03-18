/**
 * Hooks React Query pour les données principales
 * Utilise le caching automatique avec React Query
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryKeys, queryOptions } from "@/config/reactQuery";
import {
  getAllCentres,
  getActiveAlerts,
  getUserProfile,
} from "@/services/user.service";

/**
 * Hook pour récupérer tous les centres
 * Cache : 5 minutes de fraîcheur, 15 minutes total
 */
export const useAllCentres = (): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: queryKeys.centres.list(),
    queryFn: async () => {
      const res = await getAllCentres();
      if (!res.success || !res.centres) {
        throw new Error("Erreur lors de la récupération des centres");
      }
      return res.centres;
    },
    ...queryOptions.medium,
  });
};

/**
 * Hook pour récupérer les alertes actives
 * Cache : 30 secondes (données critiques)
 */
export const useActiveAlerts = (): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: queryKeys.alerts.active(),
    queryFn: async () => {
      const res = await getActiveAlerts();
      if (!res.success) {
        throw new Error("Erreur lors de la récupération des alertes");
      }
      return res.alerts || [];
    },
    ...queryOptions.critical,
  });
};

/**
 * Hook pour récupérer le profil utilisateur
 * Cache : 1 minute
 */
export const useUserProfile = (
  userId: number | string,
  enabled: boolean = true,
): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: async () => {
      const res = await getUserProfile(userId);
      if (!res.success) {
        throw new Error("Erreur lors de la récupération du profil");
      }
      return res.user;
    },
    enabled,
    ...queryOptions.short,
  });
};

/**
 * Hook pour les alertes publiques
 * Cache : 30 secondes
 */
export const usePublicAlerts = (): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: queryKeys.alerts.public(),
    queryFn: async () => {
      try {
        const res = await getActiveAlerts();
        return res.alerts || [];
      } catch (error) {
        console.error("Erreur récupération alertes publiques:", error);
        return [];
      }
    },
    ...queryOptions.critical,
  });
};
