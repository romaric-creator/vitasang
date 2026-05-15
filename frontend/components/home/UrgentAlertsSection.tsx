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

export const UrgentAlertsSection = ({ activeAlerts, t }: UrgentAlertsSectionProps) => {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <View style={styles.titleIndicator} />
          <Text style={styles.sectionTitle}>{t("home.urgentSection")}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/alertes")}>
          <Text style={styles.seeAllText}>{t("common.seeAll")}</Text>
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
          {activeAlerts.map((alert: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={styles.urgentCard}
              onPress={() =>
                router.push({
                  pathname: "/alert-response/[id]",
                  params: { id: alert.id },
                })
              }
              activeOpacity={0.9}
            >
              <View style={styles.urgentHeader}>
                <View style={styles.bloodBadge}>
                  <Text style={styles.bloodText}>{alert.groupe}</Text>
                </View>
                <View style={styles.urgencyBadge}>
                  <View style={styles.dot} />
                  <Text style={styles.urgencyText}>
                    {alert.urgence}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.hospitalName} numberOfLines={1}>
                {alert.lieu}
              </Text>
              
              <View style={styles.urgentFooter}>
                <View style={styles.locationInfo}>
                  <TabBarIcon
                    name="map-marker"
                    size={14}
                    color={color.textSecondary}
                  />
                  <Text style={styles.distanceText}>{t("home.nearby")}</Text>
                </View>
                <View style={styles.actionBtn}>
                  <Text style={styles.actionText}>
                    {t("home.donate")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <TabBarIcon name="heart-o" size={28} color={color.success} />
          </View>
          <Text style={styles.emptyText}>{t("home.noUrgentAlerts")}</Text>
          <Text style={styles.emptySubText}>{t("alert.empty.sent")}</Text>
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
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleIndicator: {
    width: 4,
    height: 20,
    backgroundColor: color.secondary, // Teal pour le sérieux
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: color.text,
    letterSpacing: -0.5,
  },
  seeAllText: {
    color: color.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
  scrollContent: {
    paddingRight: 20,
    paddingVertical: 12,
  },
  urgentCard: {
    width: width * 0.78,
    backgroundColor: color.surface,
    borderRadius: 28,
    padding: 24,
    marginRight: 16,
    borderWidth: 0, // NO BORDER
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  urgentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bloodBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: color.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodText: {
    fontSize: 20,
    fontWeight: "900",
    color: color.primary,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: color.background,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.primary,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "800",
    color: color.textMain,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hospitalName: {
    fontSize: 19,
    fontWeight: "900",
    color: color.text,
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  urgentFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "700",
  },
  actionBtn: {
    backgroundColor: color.secondary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyState: {
    backgroundColor: color.secondaryGhost,
    borderRadius: 28,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: color.secondaryLight,
    borderStyle: "dashed",
    opacity: 0.8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "900",
    color: color.secondaryDark,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 15,
    color: color.secondary,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },

});

