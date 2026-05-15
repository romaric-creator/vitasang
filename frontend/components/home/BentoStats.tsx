import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface BentoStatsProps {
  userData: any;
  t: (key: string) => string;
}

export const BentoStats = ({ userData, t }: BentoStatsProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.heroBlock]}
        onPress={() => router.push("/historique")}
        activeOpacity={0.9}
      >
        <View style={styles.heroHeader}>
          <View style={styles.iconCircle}>
            <TabBarIcon name="heart" size={24} color="white" />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroLabel}>{t("home.livesSaved")}</Text>
            <Text style={styles.heroSub}>{t("history.empty")}</Text>
          </View>
        </View>
        <Text style={styles.heroValue}>{userData?.donsCount || 0}</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={[styles.statItem, styles.bloodBlock]}>
          <Text style={styles.statLabel}>{t("home.bloodGroup")}</Text>
          <Text style={styles.bloodValue}>
            {userData?.groupe_sanguin || "--"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.statItem, styles.nextBlock]}
          onPress={() => router.push("/eligibility-test")}
          activeOpacity={0.7}
        >
          <View style={styles.nextHeader}>
            <TabBarIcon name="calendar" size={16} color={color.primary} />
            <Text style={styles.statLabel}>{t("home.nextDonation")}</Text>
          </View>
          <Text style={styles.nextValue}>{t("home.available")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 24,
  },
  heroBlock: {
    backgroundColor: color.primary,
    borderRadius: 32,
    padding: 24,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTextContainer: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
    letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  heroValue: {
    fontSize: 68,
    fontWeight: "950",
    color: "white",
    letterSpacing: -2,
    marginTop: -4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 0,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
  },
  bloodBlock: {
    alignItems: "flex-start",
    backgroundColor: "white",
  },
  nextBlock: {
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: color.secondaryGhost,
  },
  nextHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: color.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bloodValue: {
    fontSize: 40,
    fontWeight: "950",
    color: color.secondaryDark,
    letterSpacing: -1,
    marginTop: 6,
  },
  nextValue: {
    fontSize: 16,
    fontWeight: "900",
    color: color.secondary,
  },

});

