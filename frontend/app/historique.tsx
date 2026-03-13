import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { ModernSpinner } from "@/components/ModernSpinner";
import { useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { DataCard, DataCardRow } from "@/components/DataCard";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { getUserIdFromStorage } from "@/utils/storage";
import { getUserHistory } from "@/services/user.service";
import { useAlert } from "@/hooks/useAlert";

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

import { useTranslation } from "react-i18next";

export default function Historique() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const id = await getUserIdFromStorage();
      if (id) {
        const res = await getUserHistory(id);
        if (res.success && res.history) {
          setDonations(res.history);
        } else {
          setDonations([]);
        }
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

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

  const DonationCard = ({ item }: { item: DonationHistory }) => {
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
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title={t("history.title")} />
        <LoadingOverlay visible={true} message={t('common.loading')} />
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
          renderItem={({ item }) => <DonationCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
