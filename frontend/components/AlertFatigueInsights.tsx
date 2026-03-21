import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { color } from "@/constant/color";
import { alertFatigueManager } from "@/services/alertFatigueService";
import { useTranslation } from "react-i18next";

interface AlertFatigueInsightsProps {
  visible?: boolean;
}

export const AlertFatigueInsights: React.FC<AlertFatigueInsightsProps> = ({
  visible = true,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>("");
  const [icon, setIcon] = useState<string>("heart");
  const [bgColor, setBgColor] = useState<string>("#FFF0F0");

  useEffect(() => {
    loadEngagementStatus();
  }, []);

  const loadEngagementStatus = async () => {
    try {
      const stats = await alertFatigueManager.getFatigueStats();

      // Messages clairs et simples basés sur l'engagement
      if (stats.totalAlertsToday === 0) {
        setMessage(t("alert.fatigue.noAlerts"));
        setIcon("bell-off");
        setBgColor("#F0F9FF");
      } else if (stats.isFatigued) {
        setMessage(t("alert.fatigue.isFatigued"));
        setIcon("alert");
        setBgColor("#FEF2F2");
      } else if (stats.acceptanceRate > 70) {
        setMessage(t("alert.fatigue.highEngagement"));
        setIcon("heart");
        setBgColor("#F0FDF4");
      } else if (stats.acceptanceRate > 30) {
        setMessage(t("alert.fatigue.regularParticipation"));
        setIcon("star");
        setBgColor("#FFFBEB");
      } else {
        setMessage(t("alert.fatigue.explore"));
        setIcon("help-circle");
        setBgColor("#F5F3FF");
      }
    } catch (error) {
      console.error("Error loading engagement status:", error);
    }
  };

  if (!visible || !message) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={icon as any}
          size={32}
          color={color.primary}
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.15)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  icon: {
    flexShrink: 0,
  },
  message: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
    lineHeight: 20,
    flex: 1,
  },
});
