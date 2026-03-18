/**
 * React Query Hooks for Centers and Appointments
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";

// ╔════════════════════════════════════════════════════════════════╗
// ║                 CENTERS (Centres de Santé)                     ║
// ╚════════════════════════════════════════════════════════════════╝

/**
 * Get nearby blood centers
 * ✅ Caches based on location radius
 * ✅ 10 minute cache - location data relatively static
 */
export const useNearbyCenters = (
  latitude: number,
  longitude: number,
  radius: number = 50,
) => {
  return useQuery({
    queryKey: queryKeys.centers.nearby(latitude, longitude, radius),
    queryFn: () =>
      fetch(
        `/api/centres/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      ).then((r) => r.json()),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
    enabled: !!latitude && !!longitude,
  });
};

/**
 * Get blood center details
 * ✅ Individual center caching
 */
export const useCenterDetail = (centerId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.centers.detail(centerId),
    queryFn: () => fetch(`/api/centres/${centerId}`).then((r) => r.json()),
    enabled: enabled && !!centerId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Get blood stocks for a center
 * ✅ 20 minute cache (stocks change relatively slowly)
 */
export const useCenterStocks = (centerId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.centers.stocks(centerId),
    queryFn: () =>
      fetch(`/api/centres/${centerId}/stocks`).then((r) => r.json()),
    enabled: enabled && !!centerId,
    staleTime: 1000 * 60 * 20,
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
};

// ╔════════════════════════════════════════════════════════════════╗
// ║                     APPOINTMENTS                               ║
// ╚════════════════════════════════════════════════════════════════╝

/**
 * Get current user's appointments
 * ✅ 3 minute cache (appointments are time-sensitive)
 */
export const useMyAppointments = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.appointments.myAppointments(),
    queryFn: () =>
      fetch("/api/rendezvous/my-appointments").then((r) => r.json()),
    enabled,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  });
};

/**
 * Get appointment detail
 * ✅ Individual appointment caching
 */
export const useAppointmentDetail = (
  appointmentId: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: queryKeys.appointments.detail(appointmentId),
    queryFn: () =>
      fetch(`/api/rendezvous/${appointmentId}`).then((r) => r.json()),
    enabled: enabled && !!appointmentId,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Get appointments for a specific center
 * ✅ Used by center detail views
 */
export const useCenterAppointments = (
  centerId: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: queryKeys.appointments.byCenter(centerId),
    queryFn: () =>
      fetch(`/api/rendezvous/center/${centerId}`).then((r) => r.json()),
    enabled: enabled && !!centerId,
    staleTime: 1000 * 60 * 5,
  });
};

// ╔════════════════════════════════════════════════════════════════╗
// ║                    MUTATIONS                                   ║
// ╚════════════════════════════════════════════════════════════════╝

/**
 * Create appointment
 * ✅ Auto-invalidates user's appointments list
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id_centre: number;
      id_type_don: number;
      date_heure_rdv: string;
    }) =>
      fetch("/api/rendezvous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),

    onSuccess: (newAppointment) => {
      // Invalidate user's appointments
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.myAppointments(),
      });

      // Invalidate center appointments if applicable
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.byCenter(newAppointment.id_centre),
      });

      // Cache the new appointment
      queryClient.setQueryData(
        queryKeys.appointments.detail(newAppointment.id_rendez_vous),
        newAppointment,
      );
    },
  });
};

/**
 * Cancel appointment
 * ✅ Auto-invalidates related lists
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: number) =>
      fetch(`/api/rendezvous/${appointmentId}`, {
        method: "DELETE",
      }).then((r) => r.json()),

    onSuccess: (_, appointmentId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.appointments.detail(appointmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.myAppointments(),
      });
    },
  });
};

/**
 * Update appointment
 * ✅ Auto-refetch related data
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: number;
      data: any;
    }) =>
      fetch(`/api/rendezvous/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),

    onSuccess: (updatedAppointment) => {
      queryClient.setQueryData(
        queryKeys.appointments.detail(updatedAppointment.id_rendez_vous),
        updatedAppointment,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.myAppointments(),
      });
    },
  });
};
