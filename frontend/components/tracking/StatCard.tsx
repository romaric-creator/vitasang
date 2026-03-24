import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
}

export const StatCard = ({ label, value, icon, iconColor }: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBg, { backgroundColor: iconColor + "15" }]}>
      <TabBarIcon
        name={icon}
        family="fontawesome"
        size={14}
        color={iconColor}
      />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.02,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  statLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
    marginTop: 2,
  },
});
