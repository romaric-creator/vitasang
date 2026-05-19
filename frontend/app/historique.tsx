import React, { useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SkeletonListLoader } from "@/components/SkeletonLoader";
import { useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { DataCard, DataCardRow } from "@/components/DataCard";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/config/axiosConfig";
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
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <TabBarIcon name="arrow-left" size={20} color={color.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("history.title") || "Historique des dons"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {donations.length === 0 && !isLoading ? (
        <View style={styles.centerContent}>
          <View style={styles.emptyIconBox}>
            <TabBarIcon name="history" size={48} color={color.textMuted} />
          </View>
          <Text style={styles.emptyText}>{t("history.empty") || "Aucun don enregistré pour le moment."}</Text>
          <PrimaryButton
            title={t("history.createAlert") || "Lancer une alerte"}
            onPress={() => router.push("/(tabs)")}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <FlatList
          data={donations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[color.primary]} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={isLoading ? <SkeletonListLoader count={4} itemHeight={120} /> : null}
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
