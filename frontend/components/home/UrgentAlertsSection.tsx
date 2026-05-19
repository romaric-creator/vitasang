import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface UrgentAlertsSectionProps {
  activeAlerts: any[];
  t: (key: string) => string;
}

const getUrgencyStyle = (urgence: string) => {
  if (urgence === "TRES_URGENT" || urgence === "TRES URGENT") {
    return {
      borderColor: color.error,
      badgeBg: color.errorLight,
      badgeText: color.error,
    };
  }
  if (urgence === "URGENT") {
    return {
      borderColor: color.warning,
      badgeBg: color.warningLight,
      badgeText: color.warning,
    };
  }
  return {
    borderColor: color.accent,
    badgeBg: color.accentLight,
    badgeText: color.accent,
  };
};

export const UrgentAlertsSection = ({ activeAlerts, t }: UrgentAlertsSectionProps) => {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{t("home.urgentSection") || "Alertes actives"}</Text>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{activeAlerts.length}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/alertes")}>
          <Text style={styles.seeAllText}>{t("common.seeAll") || "Voir tout"}</Text>
        </TouchableOpacity>
      </View>

      {activeAlerts.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.78 + 16}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
        >
          {activeAlerts.map((alert: any, idx: number) => {
            const urgencyStyle = getUrgencyStyle(alert.urgence);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.urgentCard, { borderLeftColor: urgencyStyle.borderColor }]}
                onPress={() =>
                  router.push({
                    pathname: "/alert-response/[id]",
                    params: { id: alert.id },
                  })
                }
                activeOpacity={0.9}
              >
                {/* Header: badge urgence + distance */}
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: urgencyStyle.badgeBg }]}>
                    <Text style={[styles.statusText, { color: urgencyStyle.badgeText }]}>
                      {(alert.urgence || "NORMAL").toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <TabBarIcon name="map-marker" size={13} color={color.textLight} />
                    <Text style={styles.distanceText}>2.3 km</Text>
                  </View>
                </View>

                {/* Corps: groupe sanguin + infos hôpital */}
                <View style={styles.cardMain}>
                  <View style={styles.bloodBox}>
                    <Text style={styles.bloodText}>{alert.groupe}</Text>
                  </View>
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName} numberOfLines={2}>
                      {alert.lieu}
                    </Text>
                    <Text style={styles.locationDetail}>Douala, Littoral</Text>
                    {alert.quantite > 1 && (
                      <Text style={styles.quantiteText}>{alert.quantite} poches requises</Text>
                    )}
                  </View>
                </View>

                {/* Bouton Répondre */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() =>
                    router.push({ pathname: "/alert-response/[id]", params: { id: alert.id } })
                  }
                >
                  <Text style={styles.primaryBtnText}>
                    {t("home.respond") || "Répondre"} →
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <TabBarIcon name="heart" size={32} color={color.success} />
          </View>
          <Text style={styles.emptyText}>
            {t("home.noUrgentAlerts") || "Aucune alerte urgente — Merci aux donneurs !"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: color.textMain,
  },
  alertBadge: {
    backgroundColor: color.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  alertBadgeText: {
    color: color.error,
    fontSize: 10,
    fontWeight: "800",
  },
  seeAllText: {
    color: color.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  scrollContent: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  urgentCard: {
    width: width * 0.78,
    backgroundColor: color.surface,
    borderRadius: 24,
    borderLeftWidth: 4,
    padding: 20,
    marginRight: 16,
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    color: color.textSecondary,
    fontWeight: "600",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  bloodBox: {
    width: 60,
    height: 60,
    backgroundColor: color.primaryGhost,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  bloodText: {
    fontSize: 22,
    fontWeight: "900",
    color: color.primary,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 2,
  },
  locationDetail: {
    fontSize: 13,
    color: color.textSecondary,
    marginBottom: 2,
  },
  quantiteText: {
    fontSize: 12,
    color: color.accent,
    fontWeight: "600",
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: color.primary,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    color: color.textWhite,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    backgroundColor: color.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: color.borderLight,
    borderStyle: "dashed",
    gap: 12,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.successLight,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: color.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
