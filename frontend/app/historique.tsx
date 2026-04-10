import React, { useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import { SkeletonListLoader } from "@/components/SkeletonLoader";
import { useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { DataCard, DataCardRow } from "@/components/DataCard";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/config/axiosConfig";
import { useNotification } from "@/context/NotificationContext";
import { useTranslation } from "react-i18next";

interface DonationHistory {
  id: number;
  date_don: string;
  type_don: string;
  quantite: number;
  centre: {
    nom: string;
    ville: string;
  };
}

export default function Historique() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user: authUser } = useAuth();

  // ✅ userId depuis AuthContext — synchrone, pas de waterfall
  const userId = authUser?.id_utilisateur ?? authUser?.id ?? null;

  // ✅ React Query avec cache 10 minutes
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['user-history', userId],
    queryFn: () => apiClient.get(`/users/${userId}/history`).then(r => r.data),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 20,
  });

  const donations: DonationHistory[] = data?.history || [];

  const formatDate = useCallback((dateString: string) => {
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
  }, [i18n.language]);

  const DonationCard = memo(({ item }: { item: DonationHistory }) => {
    const data: DataCardRow[] = [
      { label: t("history.date"), value: formatDate(item.date_don) },
      { label: t("history.center"), value: item.centre?.nom || "N/A" },
      { label: t("history.city"), value: item.centre?.ville || "N/A" },
    ];

    return (
      <DataCard
        title={item?.type_don || t("history.defaultType")}
        badgeText={`${item?.quantite || 0} mL`}
        data={data}
      />
    );
  });

  const renderItem = useCallback(({ item }: { item: DonationHistory }) => (
    <DonationCard item={item} />
  ), [DonationCard]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title={t("history.title")} />
        <SkeletonListLoader count={6} itemHeight={120} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("history.title")} />

      {donations.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>{t("history.empty")}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.buttonText}>{t("history.createAlert")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={donations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[color.primary]} />
          }
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
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
