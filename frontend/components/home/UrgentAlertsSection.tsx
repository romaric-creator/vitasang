import React, { useCallback } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, useWindowDimensions } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface UrgentAlertsSectionProps {
  activeAlerts: any[];
  t: (key: string) => string;
}

const getUrgencyStyle = (urgence: string) => {
  if (urgence === "TRES_URGENT" || urgence === "TRES URGENT") {
    return {
      bg: color.errorLight,
      accent: color.error,
      label: "TRÈS URGENT",
    };
  }
  if (urgence === "URGENT") {
    return {
      bg: color.warningLight,
      accent: color.warning,
      label: "URGENT",
    };
  }
  return {
    bg: color.accentLight,
    accent: color.accent,
    label: "NORMAL",
  };
};

const getTimeAgo = (date: string | undefined): string => {
  if (!date) return "";
  const now = new Date();
  const created = new Date(date);
  const diffMin = Math.floor((now.getTime() - created.getTime()) / 60000);
  if (diffMin < 1) return "< 1 min";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return `${Math.floor(diffH / 24)}j`;
};

const AlertCard = React.memo(({ alert, t, onPress }: {
  alert: any;
  t: (key: string) => string;
  onPress: () => void;
}) => {
  const urgency = getUrgencyStyle(alert.urgence);
  const timeAgo = getTimeAgo(alert.date || alert.createdAt || alert.created_at);

  return (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${alert.groupe} ${urgency.label} ${alert.lieu}`}
    >
      {/* Left: Blood group badge */}
      <View style={[styles.bloodBadge, { backgroundColor: urgency.bg }]}>
        <Text style={[styles.bloodText, { color: urgency.accent }]}>
          {alert.groupe}
        </Text>
      </View>

      {/* Center: Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardTopRow}>
          <View style={[styles.urgencyPill, { backgroundColor: urgency.bg }]}>
            <View style={[styles.urgencyDot, { backgroundColor: urgency.accent }]} />
            <Text style={[styles.urgencyText, { color: urgency.accent }]}>
              {urgency.label}
            </Text>
          </View>
          {timeAgo ? <Text style={styles.timeText}>{timeAgo}</Text> : null}
        </View>

        <Text style={styles.locationText} numberOfLines={1}>
          {alert.lieu}
        </Text>

        {alert.quantite_requise > 1 && (
          <Text style={styles.quantityText}>
            {alert.quantite_requise} {t("home.bagsRequired")}
          </Text>
        )}
      </View>

      {/* Right: Arrow */}
      <View style={styles.arrowContainer}>
        <TabBarIcon name="chevron-right" size={16} color={color.textLight} />
      </View>
    </TouchableOpacity>
  );
});

export const UrgentAlertsSection = React.memo(({ activeAlerts, t }: UrgentAlertsSectionProps) => {
  const router = useRouter();

  const handlePress = useCallback((id: number) => {
    router.push({ pathname: "/alert-response/[id]", params: { id } });
  }, [router]);

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.liveDot} />
          <Text style={styles.sectionTitle}>
            {t("home.urgentSection") || "Besoins Urgents"}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{activeAlerts.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/alertes")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>{t("common.seeAll") || "Voir tout"}</Text>
        </TouchableOpacity>
      </View>

      {/* Alert list (vertical, max 3 shown) */}
      {activeAlerts.slice(0, 3).map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          t={t}
          onPress={() => handlePress(alert.id)}
        />
      ))}

      {activeAlerts.length > 3 && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => router.push("/(tabs)/alertes")}
        >
          <Text style={styles.showMoreText}>
            +{activeAlerts.length - 3} {t("home.moreAlerts") || "autres alertes"}
          </Text>
          <TabBarIcon name="arrow-right" size={12} color={color.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginBottom: color.spacing.l,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: color.spacing.m,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: color.spacing.s,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.error,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: color.errorLight,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  countText: {
    color: color.error,
    fontSize: 11,
    fontWeight: "800",
  },
  seeAllText: {
    color: color.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  // Alert card — horizontal row layout
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    borderRadius: color.radius.l,
    padding: color.spacing.m,
    marginBottom: color.spacing.s,
    borderWidth: 1,
    borderColor: color.borderLight,
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  bloodBadge: {
    width: 52,
    height: 52,
    borderRadius: color.radius.l,
    justifyContent: "center",
    alignItems: "center",
    marginRight: color.spacing.m,
  },
  bloodText: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: color.spacing.s,
  },
  urgencyPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: color.radius.s,
    gap: 4,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 11,
    color: color.textLight,
    fontWeight: "600",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  quantityText: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "500",
  },
  arrowContainer: {
    marginLeft: color.spacing.s,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },

  // Show more
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: color.spacing.s,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: color.primary,
  },

  // Empty state
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.successLight,
    borderRadius: color.radius.l,
    padding: color.spacing.m,
    gap: color.spacing.m,
  },
  emptyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTextContainer: {
    flex: 1,
  },
  emptyTitle: {
    color: color.textMain,
    fontSize: 14,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: color.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
});
