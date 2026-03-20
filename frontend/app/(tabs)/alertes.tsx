import React, { useEffect, useState, useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useMyAlerts, useAcceptedAlerts } from "@/hooks/useAlerts";
import { useTranslation } from "react-i18next";
import { SkeletonListLoader } from "@/components/SkeletonLoader";

export default function AlertesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sent" | "accepted">("sent");
  const myAlertsQuery = useMyAlerts(activeTab === "sent");
  const acceptedAlertsQuery = useAcceptedAlerts(activeTab === "accepted");

  const currentQuery =
    activeTab === "sent" ? myAlertsQuery : acceptedAlertsQuery;
  const loading = currentQuery.isLoading && !currentQuery.data;
  const alerts = currentQuery.data?.alerts || [];
  const refreshing = currentQuery.isRefetching;

  const onRefresh = () => {
    currentQuery.refetch();
  };

  const handleCall = useCallback((phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleShareWhatsApp = useCallback((item: any) => {
    const urgencyLabel = t(`alert.urgencyLevels.${item.urgence || "NORMAL"}`);
    const message = t("alert.shareMessage", {
      group: item.groupe,
      location: item.lieu || "Hôpital proche",
      lat: item.latitude || "0",
      lng: item.longitude || "0",
      urgency: urgencyLabel,
      quantity: item.quantite || item.quantite_requise || "1",
      phone: item.telephone_initiateur || "",
      id: item.id || "0000",
    });
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
      }
    });
  }, [t]);

  const onCardPress = useCallback((id: number) => {
    if (activeTab === "sent") {
      router.push(`/alert-tracking/${id}`);
    }
  }, [activeTab, router]);

  // Composant d'item mémorisé pour éviter les re-rendus inutiles
  const AlertCard = memo(({ item }: { item: any }) => {
    const getStatutColor = (statut: string) => {
      switch (statut) {
        case "en_cours": return "#F39C12";
        case "resolu":
        case "satisfaite": return "#2ECC71";
        case "annule": return "#E74C3C";
        default: return "#BDC3C7";
      }
    };

    return (
      <TouchableOpacity
        style={styles.alertCard}
        onPress={() => onCardPress(item.id)}
        disabled={activeTab === "accepted"}
      >
        <View style={[styles.bloodCircle]}>
          <Text style={styles.bloodText}>{item.groupe}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertDate}>
            {new Date(item.date).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {activeTab === "sent" ? (
            <View style={styles.statsRow}>
              <TabBarIcon name="bell" size={12} color={color.textSecondary} />
              <Text style={styles.alertStat}>
                {item.notifiedCount} {t("profile.alerts")}
              </Text>
              <View
                style={[
                  styles.statutBadgeMini,
                  { backgroundColor: getStatutColor(item.statut) },
                ]}
              >
                <Text style={styles.statutTextMini}>
                  {t(`alert.status.${item.statut}`) !== `alert.status.${item.statut}`
                    ? t(`alert.status.${item.statut}`)
                    : item.statut.charAt(0).toUpperCase() + item.statut.slice(1)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.shareIconBtn}
                onPress={() => handleShareWhatsApp(item)}
              >
                <TabBarIcon name="whatsapp" size={16} color="#25D366" />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.initiateurName}>{item.initiateur}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(item.telephone_initiateur)}
                >
                  <TabBarIcon name="phone" size={12} color="white" />
                  <Text style={styles.callBtnText}>
                    {t("alert.actions.call")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => handleShareWhatsApp(item)}
                >
                  <TabBarIcon name="whatsapp" size={12} color="white" />
                  <Text style={styles.callBtnText}>{t("alert.actions.share")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        {activeTab === "accepted" && (
          <View
            style={[
              styles.statutBadge,
              { backgroundColor: getStatutColor(item.statut) },
            ]}
          >
            <Text style={styles.statutText}>
              {t(`alert.status.${item.statut}`) !== `alert.status.${item.statut}`
                ? t(`alert.status.${item.statut}`)
                : item.statut.charAt(0).toUpperCase() + item.statut.slice(1)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  });

  const renderItem = useCallback(({ item }: { item: any }) => (
    <AlertCard item={item} />
  ), [AlertCard]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("profile.alerts")}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <TabBarIcon name="refresh" size={20} color={color.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sent" && styles.activeTabText,
            ]}
          >
            {t("alert.tabs.myAlerts")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "accepted" && styles.activeTab]}
          onPress={() => setActiveTab("accepted")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "accepted" && styles.activeTabText,
            ]}
          >
            {t("alert.tabs.myResponses")}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <SkeletonListLoader count={5} itemHeight={100} />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[color.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <TabBarIcon name="bell-slash" size={48} color={color.textLight} />
              <Text style={styles.emptyText}>
                {activeTab === "sent"
                  ? t("alert.empty.sent")
                  : t("alert.empty.accepted")}
              </Text>
              <Text style={styles.emptySubText}>
                {activeTab === "sent"
                  ? t("alert.empty.subSent")
                  : t("alert.empty.subAccepted")}
              </Text>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "900", color: color.textMain },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: color.textSecondary,
  },
  activeTabText: {
    color: color.primary,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
    elevation: 2,
  },
  bloodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color.dangerLight,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodText: { color: color.primary, fontWeight: "900", fontSize: 16 },
  alertDate: { fontSize: 12, color: color.textSecondary, marginBottom: 4 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  alertStat: { fontSize: 12, color: color.textSecondary, marginRight: 8 },
  initiateurName: {
    fontSize: 15,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 6,
  },
  actionRow: { flexDirection: "row", gap: 8 },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: color.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#25D366", // WhatsApp Green
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareIconBtn: {
    marginLeft: "auto",
    padding: 4,
  },
  callBtnText: { color: "white", fontSize: 11, fontWeight: "700" },
  statutBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statutText: { color: "white", fontSize: 10, fontWeight: "700" },
  statutBadgeMini: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  statutTextMini: { color: "white", fontSize: 9, fontWeight: "800" },
  empty: { marginTop: 100, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 18, fontWeight: "700", color: color.textMain },
  emptySubText: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
