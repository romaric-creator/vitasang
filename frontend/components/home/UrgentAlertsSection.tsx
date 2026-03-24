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
        <Text style={styles.sectionTitle}>{t("home.urgentSection")}</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/alertes")}>
          <Text style={styles.seeAllText}>{t("common.seeAll")}</Text>
        </TouchableOpacity>
      </View>

      {activeAlerts.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.75 + 16}
          decelerationRate="fast"
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
            >
              <View style={styles.urgentHeader}>
                <View style={styles.urgentBloodCircle}>
                  <Text style={styles.urgentBloodText}>{alert.groupe}</Text>
                </View>
                <View style={styles.urgentUrgencyBadge}>
                  <Text style={styles.urgentUrgencyText}>
                    {alert.urgence}
                  </Text>
                </View>
              </View>
              <Text style={styles.urgentHospital} numberOfLines={1}>
                {alert.lieu}
              </Text>
              <View style={styles.urgentFooter}>
                <TabBarIcon
                  name="map-marker"
                  size={12}
                  color={color.textSecondary}
                />
                <Text style={styles.urgentDistance}>{t("home.nearby")}</Text>
                <View style={styles.urgentAction}>
                  <Text style={styles.urgentActionText}>
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
            <TabBarIcon name="smile-o" size={32} color={color.success} />
          </View>
          <Text style={styles.emptyText}>{t("alert.empty.sent")}</Text>
          <Text style={styles.emptySubText}>{t("home.noUrgentAlerts")}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: -0.5,
  },
  seeAllText: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  urgentCard: {
    width: width * 0.75,
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  urgentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  urgentBloodCircle: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  urgentBloodText: {
    fontSize: 20,
    fontWeight: "900",
    color: color.primary,
  },
  urgentUrgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: color.background,
  },
  urgentUrgencyText: {
    fontSize: 10,
    fontWeight: "800",
    color: color.primary,
  },
  urgentHospital: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 12,
  },
  urgentFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgentDistance: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    flex: 1,
  },
  urgentAction: {
    backgroundColor: color.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  urgentActionText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyState: {
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    borderStyle: "dashed",
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FFF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: color.textSecondary,
    fontWeight: "600",
  },
});
