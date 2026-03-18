/**
 * Configuration React Query (TanStack Query) pour le caching
 * Gère le cache des données API et images
 */

import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache les données pendant 5 minutes
      staleTime: 5 * 60 * 1000,
      // Garde les données en cache pendant 10 minutes même après unmount
      gcTime: 10 * 60 * 1000,
      // Réessayer 2 fois en cas d'erreur
      retry: 2,
      // Délai avant chaque retry (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Ne pas refetch au focus par défaut
      refetchOnWindowFocus: false,
      // Ne pas refetch au remount par défaut
      refetchOnMount: false,
      // Activer les network status listeners
      networkMode: "online",
    },
    mutations: {
      // Réessayer 1 fois pour les mutations
      retry: 1,
      // Network mode pour les mutations
      networkMode: "online",
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

/**
 * Configuration spécifique pour différents types de requêtes
 */

export const queryOptions = {
  // Données criantes (alertes actives, stock sanguin)
  critical: {
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch toutes les 30s
  },

  // Données de courte durée (utilisateur actif, profil)
  short: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },

  // Données de moyenne durée (centres, liste des dons)
  medium: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },

  // Données de longue durée (groupe sanguin, types de don)
  long: {
    staleTime: 24 * 60 * 60 * 1000, // 24 heures
    gcTime: 24 * 60 * 60 * 1000, // 24 heures
  },

  // Images (cache très long)
  images: {
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 jours
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 jours
    retry: 3,
  },
};

// Clés de cache pour les requêtes (meilleure organisation)
export const queryKeys = {
  all: ["query"] as const,

  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },

  users: {
    all: ["users"] as const,
    detail: (id: number | string) =>
      [...queryKeys.users.all, "detail", id] as const,
    profile: (id: number | string) =>
      [...queryKeys.users.all, "profile", id] as const,
  },

  centres: {
    all: ["centres"] as const,
    list: () => [...queryKeys.centres.all, "list"] as const,
    detail: (id: number | string) =>
      [...queryKeys.centres.all, "detail", id] as const,
    nearby: (lat: number, lon: number, radius: number) =>
      [...queryKeys.centres.all, "nearby", lat, lon, radius] as const,
  },

  appointments: {
    all: ["appointments"] as const,
    list: () => [...queryKeys.appointments.all, "list"] as const,
    detail: (id: number | string) =>
      [...queryKeys.appointments.all, "detail", id] as const,
    user: (userId: number | string) =>
      [...queryKeys.appointments.all, "user", userId] as const,
  },

  alerts: {
    all: ["alerts"] as const,
    list: () => [...queryKeys.alerts.all, "list"] as const,
    public: () => [...queryKeys.alerts.all, "public"] as const,
    detail: (id: number | string) =>
      [...queryKeys.alerts.all, "detail", id] as const,
    user: (userId: number | string) =>
      [...queryKeys.alerts.all, "user", userId] as const,
    active: () => [...queryKeys.alerts.all, "active"] as const,
  },

  stock: {
    all: ["stock"] as const,
    detail: (centreId: number | string) =>
      [...queryKeys.stock.all, "detail", centreId] as const,
  },

  images: {
    all: ["images"] as const,
    url: (url: string) => [...queryKeys.images.all, url] as const,
  },

  donations: {
    all: ["donations"] as const,
    history: (userId: number | string) =>
      [...queryKeys.donations.all, "history", userId] as const,
  },
};
