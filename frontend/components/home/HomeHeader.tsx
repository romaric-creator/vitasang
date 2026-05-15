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
        <View style={styles.profileWrapper}>
          {profileImage ? (
            <Image source={profileImage} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <TabBarIcon name="user" size={24} color={color.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{t("home.profileLabel")}</Text>
          <Text style={styles.userName} numberOfLines={1}>{fullName}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.headerAction}
        onPress={() => router.push("/(tabs)/alertes")}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <TabBarIcon name="bell-o" size={22} color={color.secondary} />
          {hasActiveAlerts && <View style={styles.badge} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  profileWrapper: {
    padding: 3,
    borderRadius: 22,
    backgroundColor: color.secondaryGhost,
  },
  profileImage: {
    width: 54,
    height: 52,
    borderRadius: 18,
    backgroundColor: "white",
  },
  profilePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: color.secondary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "950",
    color: color.text,
    letterSpacing: -0.5,
  },
  headerAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: color.primary,
    borderWidth: 3,
    borderColor: "white",
  },
});


