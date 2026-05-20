import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { color } from "@/constant/color";

export interface DataCardRow {
  label: string;
  value: string | React.ReactNode;
  valueColor?: string;
  isBold?: boolean;
}

interface DataCardProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
  data: DataCardRow[];
  actionButton?: {
    text: string;
    onPress: () => void;
    color?: string;
  };
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  badgeText,
  badgeColor = color.primary,
  data,
  actionButton,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {badgeText && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        {data.map((row, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text
              style={[
                styles.value,
                row.valueColor && { color: row.valueColor },
                row.isBold && { fontWeight: "bold" },
              ]}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      {actionButton && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: actionButton.color || color.primary },
          ]}
          onPress={actionButton.onPress}
          accessible={true}
          accessibilityLabel={actionButton.text}
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>{actionButton.text}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: color.radius.xl,
    padding: color.spacing.l,
    marginBottom: color.spacing.m,
    shadowColor: color.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "500",
  },
  badge: {
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "white",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: color.borderLight,
    marginVertical: 12,
  },
  content: {
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  actionButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
});

