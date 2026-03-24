import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { color } from "@/constant/color";

interface StatCardProps {
  value: string;
  label: string;
}

export const HelpStatCard = ({ value, label }: StatCardProps) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: color.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },
});
