import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { TabBarIcon } from "./TabBarIcon";
import { color } from "@/constant/color";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = true,
  rightElement,
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <TabBarIcon name="chevron-left" size={20} color={color.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {rightElement ? (
        <View style={styles.rightContainer}>{rightElement}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginBottom: 8,
    backgroundColor: color.surface,
    // Soft UI Evolution: Shadow très douce pour separation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: color.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.secondary,
    // Light shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rightContainer: {
    width: 46,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  placeholder: {
    width: 46,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: color.textMain,
    textAlign: "center",
    flex: 1,
    letterSpacing: -0.3,
  },
});
