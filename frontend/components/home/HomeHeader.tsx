import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface HomeHeaderProps {
  fullName: string;
  profileImage: any;
  hasActiveAlerts: boolean;
  t: (key: string) => string;
}

export const HomeHeader = ({ fullName, profileImage, hasActiveAlerts, t }: HomeHeaderProps) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {profileImage && (
          <Image source={profileImage} style={styles.profileImage} />
        )}
        <View>
          <Text style={styles.greeting}>{t("home.profileLabel")}</Text>
          <Text style={styles.userName}>{fullName}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.headerAction}
        onPress={() => router.push("/(tabs)/alertes")}
      >
        <TabBarIcon name="bell-o" size={22} color={color.textMain} />
        {hasActiveAlerts && <View style={styles.badge} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: color.surfaceDark,
    borderWidth: 2,
    borderColor: color.primary,
  },
  greeting: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: -0.5,
  },
  headerAction: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: color.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.primary,
    borderWidth: 2,
    borderColor: color.surface,
  },
});
