import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface DonorStatusCardProps {
  groupeSanguin: string | null;
  disponible: boolean;
  donsCount: number;
  lastDonationDate?: string | null;
  t: (key: string) => string;
}

export const DonorStatusCard = React.memo(({
  groupeSanguin,
  disponible,
  donsCount,
  lastDonationDate,
  t,
}: DonorStatusCardProps) => {
  const router = useRouter();

  const statusColor = disponible ? color.success : color.textLight;
  const statusBg = disponible ? color.successLight : color.surfaceContainer;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* Blood group */}
        <View style={styles.bloodGroupContainer}>
          <View style={styles.bloodGroupCircle}>
            <Text style={styles.bloodGroupText}>
              {groupeSanguin || "?"}
            </Text>
          </View>
          <View style={styles.bloodGroupLabel}>
            <Text style={styles.labelText}>{t("home.myBloodGroup")}</Text>
            {!groupeSanguin && (
              <TouchableOpacity onPress={() => router.push("/edit-profile")}>
                <Text style={styles.addLink}>{t("home.addIt")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status */}
        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {disponible ? t("home.available") : t("home.unavailable")}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <TabBarIcon name="tint" size={14} color={color.primary} />
          <Text style={styles.statValue}>{donsCount}</Text>
          <Text style={styles.statLabel}>{t("home.donations")}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <TabBarIcon name="heart" size={14} color={color.success} />
          <Text style={styles.statValue}>{donsCount * 3}</Text>
          <Text style={styles.statLabel}>{t("home.livesSaved")}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <TabBarIcon name="calendar" size={14} color={color.accent} />
          <Text style={styles.statValue}>
            {lastDonationDate ? formatDateShort(lastDonationDate) : "—"}
          </Text>
          <Text style={styles.statLabel}>{t("home.lastDonation")}</Text>
        </View>
      </View>
    </View>
  );
});

function formatDateShort(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) return `${diffDays}j`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
  return `${Math.floor(diffDays / 30)}m`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: color.radius.xl,
    padding: color.spacing.m,
    marginBottom: color.spacing.s,
    borderWidth: 1,
    borderColor: color.borderLight,
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: color.spacing.s,
  },
  bloodGroupContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: color.spacing.s,
  },
  bloodGroupCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.primaryGhost,
    borderWidth: 2,
    borderColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodGroupText: {
    fontSize: 17,
    fontWeight: "900",
    color: color.primary,
    letterSpacing: -0.5,
  },
  bloodGroupLabel: {
    gap: 2,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    color: color.textSecondary,
  },
  addLink: {
    fontSize: 12,
    fontWeight: "700",
    color: color.accent,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: color.radius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: color.spacing.s,
    borderTopWidth: 1,
    borderTopColor: color.borderLight,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: color.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: color.borderLight,
  },
});
