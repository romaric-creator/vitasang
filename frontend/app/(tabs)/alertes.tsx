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
    // Champs : item peut utiliser `groupe` ou `groupe_sanguin` selon le endpoint
    const group = item.groupe_sanguin || item.groupe || "inconnu";
    const message = t("alert.shareMessage", {
      group,
      location: item.lieu || "Hôpital proche",
      phone: item.telephone_contact || item.telephone_initiateur || "",
      latitude: item.latitude || "",
      longitude: item.longitude || "",
      urgency: item.urgence || "URGENT",
      quantity: item.quantite_requise || "?",
      id: item.public_token || item.id || "",
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
        return { color: color.secondary, label: "Terminé" };
      case "annule":
        return { color: color.error, label: "Annulé" };
      default:
        return { color: color.textLight, label: statut };
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
            <View style={[styles.statusTag, { backgroundColor: config.color + "15" }]}>
              <View style={[styles.statusDot, { backgroundColor: config.color }]} />
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
                accessibilityRole="button"
                accessibilityLabel="Partager sur WhatsApp"
              >
                <TabBarIcon name="whatsapp" size={18} color={color.whatsapp} />
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
                  accessibilityRole="button"
                  accessibilityLabel={`Appeler ${item.initiateur || "le demandeur"}`}
                >
                  <TabBarIcon name="phone" size={12} color={color.textWhite} />
                  <Text style={styles.callButtonText}>{t("alert.call") || "Appeler"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.whatsappAction}
                  onPress={() => handleShareWhatsApp(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Partager sur WhatsApp"
                >
                  <TabBarIcon name="whatsapp" size={16} color={color.whatsapp} />
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
            onPress={() => setActiveTab(tab as "sent" | "accepted")}
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
    backgroundColor: color.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  welcomeText: { fontSize: 13, color: color.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: -0.5,
  },
  refreshBtn: {
    padding: 10,
    backgroundColor: color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.borderLight,
    elevation: 2,
    shadowColor: "black",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: color.surfaceDark,
    borderRadius: 16,
    padding: 4,
    marginBottom: 25,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  activeTab: {
    backgroundColor: color.surface,
    elevation: 4,
    shadowColor: "black",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  tabText: { fontSize: 13, fontWeight: "700", color: color.textSecondary },
  activeTabText: { color: color.primary },

  card: {
    flexDirection: "row",
    backgroundColor: color.surface,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: color.borderLight,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  indicatorContainer: { width: 70, alignItems: "center", paddingTop: 20, marginRight: 5 },
  bloodBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodText: { color: "white", fontWeight: "900", fontSize: 16 },
  verticalLine: {
    width: 3,
    flex: 1,
    marginTop: 12,
    borderRadius: 2,
    opacity: 0.15,
  },

  cardContent: { flex: 1, padding: 16, paddingLeft: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: { fontSize: 12, color: color.textMuted, fontWeight: "600" },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  sentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.secondaryGhost,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  pillText: { fontSize: 12, color: color.textSecondary, fontWeight: "600" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color.successLight,
    justifyContent: "center",
    alignItems: "center",
  },

  acceptedFooter: { gap: 10, marginTop: 4 },
  initiateur: { fontSize: 15, fontWeight: "700", color: color.textMain },
  actionRow: { flexDirection: "row", gap: 10 },
  callButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: color.secondary,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  callButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  whatsappAction: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: color.whatsapp,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: color.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: color.textMain },
  emptySub: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
