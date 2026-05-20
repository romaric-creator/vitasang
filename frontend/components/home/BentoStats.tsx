import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface BentoStatsProps {
  userData: any;
  t: (key: string) => string;
}

export const BentoStats = React.memo(({ userData, t }: BentoStatsProps) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  const stats = [
    {
      label: t("home.myDonations") || "MES DONS",
      value: userData?.donsCount || 0,
      sub: t("home.totalCompleted") || "Total",
      accent: color.primary,
      bg: color.primaryGhost,
      onPress: () => router.push("/historique"),
    },
    {
      label: t("home.livesSaved") || "VIES SAUVEES",
      value: (userData?.donsCount || 0) * 3,
      sub: t("home.impact") || "Impact",
      accent: color.success,
      bg: color.successLight,
      onPress: () => {},
    },
    {
      label: t("home.alertsSent") || "ALERTES",
      value: userData?.alertsSentCount || 1,
      sub: t("home.thisWeek") || "Semaine",
      accent: color.secondary,
      bg: color.secondaryGhost,
      onPress: () => router.push("/(tabs)/alertes"),
    },
    {
      label: t("home.nextDispo") || "DISPO",
      valueText: t("home.availableNow") || "Maintenant",
      accent: color.accent,
      bg: color.accentLight,
      onPress: () => router.push("/notifications-settings"),
    },
  ];

  const cardWidth = isSmall ? 130 : 140;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.statCard, { backgroundColor: stat.bg, width: cardWidth }]}
            onPress={stat.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>{stat.label}</Text>
            {stat.valueText ? (
              <Text style={[styles.cardValueText, { color: stat.accent }]}>{stat.valueText}</Text>
            ) : (
              <Text style={[styles.cardValue, { color: stat.accent }]}>{stat.value}</Text>
            )}
            {stat.sub && <Text style={styles.cardSub}>{stat.sub}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  statCard: {
    borderRadius: 16,
    padding: 14,
    height: 100,
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: color.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  cardValueText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardSub: {
    fontSize: 11,
    color: color.textLight,
    fontWeight: "500",
  },
});
