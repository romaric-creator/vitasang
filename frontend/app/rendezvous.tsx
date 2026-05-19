import React, { useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StatusBar,
} from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
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
  }, [cancelMutation, error, t]);

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
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <TabBarIcon name="arrow-left" size={20} color={color.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("appointments.title") || "Mes rendez-vous"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {appointments.length === 0 && !isLoading ? (
        <View style={styles.centerContent}>
          <View style={styles.emptyIconBox}>
            <TabBarIcon name="calendar" size={48} color={color.textMuted} />
          </View>
          <Text style={styles.emptyText}>{t("appointments.empty") || "Vous n'avez pas de rendez-vous prévu."}</Text>
          <PrimaryButton
            title={t("appointments.book") || "Prendre rendez-vous"}
            onPress={() => router.push("/(tabs)/map")}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={({ item }) => <AppointmentCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[color.primary]} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={isLoading ? <SkeletonListLoader count={3} itemHeight={160} /> : null}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  emptyText: {
    fontSize: 15,
    color: color.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "600",
  },
  emptyBtn: {
    width: "100%",
  },
});
