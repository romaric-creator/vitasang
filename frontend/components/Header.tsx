import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TabBarIcon } from "./TabBarIcon";
import { color } from "@/constant/color";

export default function Header({ userName = "Utilisateur", notificationCount = 0 }: { userName?: string; notificationCount?: number }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Bienvenue,</Text>
        <Text style={styles.name}>{userName}</Text>
      </View>
      <View style={styles.notificationCircle}>
        <TabBarIcon name="bell" color={color.textMain} size={22} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  welcomeText: { 
    color: color.textSecondary, 
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  name: { 
    fontSize: 24, 
    fontWeight: "700",
    color: color.textMain,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  notificationCircle: {
    backgroundColor: color.surface,
    padding: 12,
    borderRadius: 50,
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: color.primary,
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: { 
    color: color.textWhite, 
    fontSize: 11, 
    fontWeight: "700",
  },
});
