/**
 * Centralized Query Keys for React Query
 * Ensures consistent cache invalidation and data organization
 * https://tanstack.com/query/latest/docs/react/guides/important-defaults
 */

export const queryKeys = {
  // Authentication
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    profile: (userId: number) => [...queryKeys.auth.user(), userId] as const,
  },

  // Alerts
  alerts: {
    all: ["alerts"] as const,
    active: () => [...queryKeys.alerts.all, "active"] as const,
    detail: (id: number) => [...queryKeys.alerts.all, id] as const,
    myAlerts: () => [...queryKeys.alerts.all, "my-alerts"] as const,
    accepted: () => [...queryKeys.alerts.all, "accepted"] as const,
    byStatus: (status: string) =>
      [...queryKeys.alerts.all, "status", status] as const,
  },

  // Appointments (Rendez-vous)
  appointments: {
    all: ["appointments"] as const,
    detail: (id: number) => [...queryKeys.appointments.all, id] as const,
    myAppointments: () => [...queryKeys.appointments.all, "my"] as const,
    byCenter: (centerId: number) =>
      [...queryKeys.appointments.all, "center", centerId] as const,
  },

  // Blood Centers
  centers: {
    all: ["centers"] as const,
    detail: (id: number) => [...queryKeys.centers.all, id] as const,
    nearby: (latitude: number, longitude: number, radius: number) =>
      [
        ...queryKeys.centers.all,
        "nearby",
        latitude,
        longitude,
        radius,
      ] as const,
    stocks: (centerId: number) =>
      [...queryKeys.centers.all, centerId, "stocks"] as const,
  },

  // Blood Stocks
  stocks: {
    all: ["stocks"] as const,
    byCenter: (centerId: number) =>
      [...queryKeys.stocks.all, "center", centerId] as const,
    byGroup: (group: string) =>
      [...queryKeys.stocks.all, "group", group] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    detail: (id: number) => [...queryKeys.users.all, id] as const,
    profile: (id: number) => [...queryKeys.users.all, "profile", id] as const,
    donors: () => [...queryKeys.users.all, "donors"] as const,
  },

  // Donation History
  donations: {
    all: ["donations"] as const,
    myHistory: () => [...queryKeys.donations.all, "my-history"] as const,
    detail: (id: number) => [...queryKeys.donations.all, id] as const,
  },

  // Messages
  messages: {
    all: ["messages"] as const,
    inbox: () => [...queryKeys.messages.all, "inbox"] as const,
    conversation: (userId: number) =>
      [...queryKeys.messages.all, "conversation", userId] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    unread: () => [...queryKeys.notifications.all, "unread"] as const,
  },
} as const;
