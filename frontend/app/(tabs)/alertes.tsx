import React, { useState } from "react";
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

  const onRefresh = () => currentQuery.refetch();

  const handleCall = (phone: string) =>
    phone && Linking.openURL(`tel:${phone}`);

  const handleShareWhatsApp = (item: any) => {
    const message = t("alert.shareMessage", {
      group: item.groupe,
      location: item.lieu || "Hôpital proche",
      phone: item.telephone_initiateur || "",
    });
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url).then((supported) => {
      Linking.openURL(
        supported ? url : `https://wa.me/?text=${encodeURIComponent(message)}`,
      );
    });
  };

  const getStatutConfig = (statut: string) => {
    switch (statut) {
      case "en_cours":
        return { color: color.primary, label: "En cours" };
      case "resolu":
      case "satisfaite":
        return { color: "#10B981", label: "Terminé" };
      case "annule":
        return { color: "#EF4444", label: "Annulé" };
      default:
        return { color: "#64748B", label: statut };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const config = getStatutConfig(item.statut);
    const isSent = activeTab === "sent";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => isSent && router.push(`/alert-tracking/${item.id}`)}
        disabled={!isSent}
      >
        {/* Section Gauche : Indicateur Visuel */}
        <View
          style={[
            styles.indicatorContainer,
            { backgroundColor: config.color + "10" },
          ]}
        >
          <View style={[styles.bloodBadge, { backgroundColor: config.color }]}>
            <Text style={styles.bloodText}>{item.groupe}</Text>
          </View>
          <View
            style={[styles.verticalLine, { backgroundColor: config.color }]}
          />
        </View>

        {/* Section Droite : Contenu */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <View
              style={[
                styles.statusTag,
                { backgroundColor: config.color + "15" },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: config.color }]}
              />
              <Text style={[styles.statusText, { color: config.color }]}>
                {config.label.toUpperCase()}
              </Text>
            </View>
          </View>

          {isSent ? (
            <View style={styles.sentFooter}>
              <View style={styles.pill}>
                <TabBarIcon name="bell" size={12} color={color.textSecondary} />
                <Text style={styles.pillText}>
                  {item.notifiedCount} alertes envoyées
                </Text>
              </View>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => handleShareWhatsApp(item)}
              >
                <TabBarIcon name="whatsapp" size={18} color="#25D366" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.acceptedFooter}>
              <Text style={styles.initiateur} numberOfLines={1}>
                {item.initiateur}
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(item.telephone_initiateur)}
                >
                  <TabBarIcon name="phone" size={12} color="white" />
                  <Text style={styles.callButtonText}>Appeler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.whatsappAction}
                  onPress={() => handleShareWhatsApp(item)}
                >
                  <TabBarIcon name="whatsapp" size={16} color="#25D366" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Mes Activités</Text>
          <Text style={styles.title}>{t("profile.alerts")}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <TabBarIcon name="refresh" size={18} color={color.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {["sent", "accepted"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "sent"
                ? t("alert.tabs.myAlerts")
                : t("alert.tabs.myResponses")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <SkeletonListLoader count={5} itemHeight={100} />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[color.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <TabBarIcon
                  name="bell-slash"
                  size={32}
                  color={color.textLight}
                />
              </View>
              <Text style={styles.emptyTitle}>Aucune alerte ici</Text>
              <Text style={styles.emptySub}>
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  welcomeText: { fontSize: 14, color: color.textSecondary, fontWeight: "500" },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  refreshBtn: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
    shadowOpacity: 0.05,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    padding: 5,
    marginBottom: 25,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  activeTab: {
    backgroundColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  activeTabText: { color: color.primary },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  indicatorContainer: { width: 75, alignItems: "center", paddingTop: 20 ,marginRight:10},
  bloodBadge: {
    width: 45,
    height: 45,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodText: { color: "white", fontWeight: "900", fontSize: 16 },
  verticalLine: {
    width: 4,
    flex: 1,
    marginTop: 15,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.2,
  },

  cardContent: { flex: 1, padding: 20, paddingLeft: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dateText: { fontSize: 13, color: "#94A3B8", fontWeight: "500" },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal:10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 30, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5,paddingHorizontal:5 },

  sentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 12,
    gap: 6,
  },
  pillText: { fontSize: 12, color: "#475569", fontWeight: "600" },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },

  acceptedFooter: { gap: 12 },
  initiateur: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  actionRow: { flexDirection: "row", gap: 10 },
  callButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  callButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  whatsappAction: {
    width: 45,
    height: 45,
    borderWidth: 1.5,
    borderColor: "#25D366",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  emptySub: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
