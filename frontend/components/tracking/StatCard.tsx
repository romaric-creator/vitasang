import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
}

export const StatCard = ({ label, value, icon, iconColor }: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBg, { backgroundColor: iconColor + "18" }]}>
      <TabBarIcon name={icon} family="fontawesome" size={14} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: color.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: color.textMain,
  },
  statLabel: {
    fontSize: 10,
    color: color.textSecondary,
    fontWeight: "700",
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
