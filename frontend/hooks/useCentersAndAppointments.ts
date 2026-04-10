/**
 * React Query Hooks for Centers and Appointments
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { apiClient } from "@/config/axiosConfig";

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
      apiClient.get(
        `centres/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      ).then((r) => r.data),
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
    queryFn: () => apiClient.get(`centres/${centerId}`).then((r) => r.data),
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
      apiClient.get(`centres/${centerId}/stocks`).then((r) => r.data),
    enabled: enabled && !!centerId,
    staleTime: 1000 * 60 * 20,
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
};

/**
 * Get all blood centers (Centres de Santé)
 * ✅ 10 minute cache
 */
export const useAllCentres = () => {
  return useQuery({
    queryKey: queryKeys.centers.all,
    queryFn: () => apiClient.get("centres").then((r) => r.data),
    staleTime: 1000 * 60 * 10,
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
      apiClient.get("rendez-vous/my-appointments").then((r) => r.data),
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
      apiClient.get(`rendez-vous/${appointmentId}`).then((r) => r.data),
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
      apiClient.get(`rendez-vous/center/${centerId}`).then((r) => r.data),
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
      apiClient.post("rendez-vous", data).then((r) => r.data),

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
      apiClient.delete(`rendez-vous/${appointmentId}`).then((r) => r.data),

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
      apiClient.put(`rendez-vous/${appointmentId}`, data).then((r) => r.data),

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
