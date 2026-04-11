import React, { useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { DataCard, DataCardRow } from "@/components/DataCard";
import ThemedView from "@/components/ThemedView";
import { SkeletonListLoader } from "@/components/SkeletonLoader";
import { color } from "@/constant/color";
import { useMyAppointments, useCancelAppointment } from "@/hooks/useCentersAndAppointments";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";

interface Appointment {
  id: number;
  date_rendezvous: string;
  heure_debut: string;
  code_unique: string;
  status: string;
  centre: {
    nom: string;
    ville: string;
    telephone: string;
  };
  type_don: {
    nom: string;
  };
}

export default function RendezVousList() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { success, error } = useToast();

  // ✅ React Query — cache + invalidation automatique
  const { data, isLoading, isRefetching, refetch } = useMyAppointments();
  const cancelMutation = useCancelAppointment();

  const appointments: Appointment[] = data?.appointments || [];

  const handleCancel = useCallback(async (appointmentId: number) => {
    try {
      await cancelMutation.mutateAsync(appointmentId);
      success(t("appointments.canceled"));
    } catch (error: any) {
      error(t("appointments.cancelGenericError"));
    }
  }, [cancelMutation, show, t]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        i18n.language === "fr" ? "fr-CM" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "#2ecc71";
      case "COMPLETED":
        return "#3498db";
      case "CANCELLED":
        return "#e74c3c";
      default:
        return color.primary;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CONFIRMED: t("appointments.status.confirmed"),
      COMPLETED: t("appointments.status.completed"),
      CANCELLED: t("appointments.status.cancelled"),
      PENDING: t("appointments.status.pending"),
    };
    return labels[status] || status;
  };

  const AppointmentCard = ({ item }: { item: Appointment }) => {
    const data: DataCardRow[] = [
      {
        label: t("appointments.date"),
        value: formatDate(item.date_rendezvous),
      },
      { label: t("appointments.time"), value: item.heure_debut },
      { label: t("appointments.type"), value: item.type_don?.nom || "N/A" },
      {
        label: t("appointments.code"),
        value: item.code_unique,
        valueColor: color.primary,
        isBold: true,
      },
      {
        label: t("appointments.phone"),
        value: item.centre?.telephone || "N/A",
      },
    ];

    const actionButton =
      item.status !== "CANCELLED" && item.status !== "COMPLETED"
        ? {
          text: t("appointments.cancel"),
          onPress: () => handleCancel(item.id),
          color: "#e74c3c",
        }
        : undefined;

    return (
      <DataCard
        title={item.centre?.nom || "Centre"}
        subtitle={item.centre?.ville}
        badgeText={getStatusLabel(item.status)}
        badgeColor={getStatusColor(item.status)}
        data={data}
        actionButton={actionButton}
      />
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title={t("appointments.title")} />
        <SkeletonListLoader count={5} itemHeight={160} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("appointments.title")} />

      {appointments.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>{t("appointments.empty")}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(tabs)/map")}
          >
            <Text style={styles.buttonText}>{t("appointments.book")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={({ item }) => <AppointmentCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[color.primary]} />
          }
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: color.screenBackground,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    color: color.textLight,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: color.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
