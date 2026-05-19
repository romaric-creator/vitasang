import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const CARD_WIDTH = (width - 40 - 12) / 2;

interface BentoStatsProps {
  userData: any;
  t: (key: string) => string;
}

export const BentoStats = ({ userData, t }: BentoStatsProps) => {
  const router = useRouter();

  const stats = [
    {
      label: t("home.myDonations") || "MES DONS",
      value: userData?.donsCount || 0,
      sub: t("home.totalCompleted") || "Total effectués",
      color: color.primary,
      onPress: () => router.push("/historique"),
    },
    {
      label: t("home.nextDispo") || "PROCHAINE DISPO",
      valueText: t("home.availableNow") || "Disponible maintenant",
      color: color.secondary,
      onPress: () => router.push("/notifications-settings"),
    },
    {
      label: t("home.alertsSent") || "ALERTES ENVOYÉES",
      value: userData?.alertsSentCount || 1,
      sub: t("home.thisWeek") || "Cette semaine",
      color: color.textMain,
      onPress: () => router.push("/(tabs)/alertes"),
    },
    {
      label: t("home.livesSaved") || "VIES SAUVÉES",
      value: (userData?.donsCount || 0) * 3,
      sub: t("home.impact") || "Impact total",
      color: color.secondary,
      onPress: () => {},
    },
  ];

  // Cards 0 et 3 (index pair extrêmes) → secondaryGhost, cards 1 et 2 → primaryGhost
  const getCardBg = (index: number) =>
    index === 0 || index === 3 ? color.secondaryGhost : color.primaryGhost;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.statCard, { backgroundColor: getCardBg(index), width: CARD_WIDTH }]}
            onPress={stat.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>{stat.label}</Text>
            <View style={styles.valueBlock}>
              {stat.valueText ? (
                <Text style={[styles.cardValueText, { color: stat.color }]}>
                  {stat.valueText}
                </Text>
              ) : (
                <Text style={[styles.cardValue, { color: stat.color }]}>{stat.value}</Text>
              )}
              {stat.sub && <Text style={styles.cardSub}>{stat.sub}</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: color.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  valueBlock: {
    flexDirection: "column",
    gap: 2,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 36,
  },
  cardValueText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  cardSub: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "500",
  },
});
