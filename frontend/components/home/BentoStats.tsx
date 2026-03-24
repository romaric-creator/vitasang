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
    <View style={styles.bentoRow}>
      <TouchableOpacity
        style={[styles.bentoItem, styles.heroBlock]}
        onPress={() => router.push("/historique")}
      >
        <View style={styles.heroIconCircle}>
          <TabBarIcon name="heart" size={24} color="white" />
        </View>
        <Text style={styles.heroValue}>{userData?.donsCount || 0}</Text>
        <Text style={styles.heroLabel}>{t("home.livesSaved")}</Text>
        <Text style={styles.heroSub}>
          {t("history.empty")?.split(".")[0]}
        </Text>
      </TouchableOpacity>

      <View style={styles.bentoColumn}>
        <View style={[styles.bentoItem, styles.bloodBlock]}>
          <Text style={styles.bloodLabel}>{t("home.bloodGroup")}</Text>
          <Text style={styles.bloodValue}>
            {userData?.groupe_sanguin || "--"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bentoItem, styles.statusBlock]}
          onPress={() => router.push("/eligibility-test")}
        >
          <TabBarIcon
            name="calendar-check-o"
            size={18}
            color={color.primary}
          />
          <Text style={styles.statusLabel}>{t("home.nextDonation")}</Text>
          <Text style={styles.statusValue}>{t("home.available")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bentoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  bentoColumn: {
    flex: 1,
    gap: 12,
  },
  bentoItem: {
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
  heroBlock: {
    flex: 1.2,
    backgroundColor: color.primary,
    borderColor: color.primary,
    justifyContent: "center",
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 42,
    fontWeight: "900",
    color: "white",
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
    marginTop: -4,
  },
  heroSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    fontWeight: "600",
  },
  bloodBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bloodLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textSecondary,
    textTransform: "uppercase",
  },
  bloodValue: {
    fontSize: 32,
    fontWeight: "900",
    color: color.primary,
    letterSpacing: -1,
  },
  statusBlock: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textSecondary,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "900",
    color: color.success,
  },
});
