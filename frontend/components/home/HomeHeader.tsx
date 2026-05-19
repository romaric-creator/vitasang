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
        <View style={[styles.profileWrapper, profileImage ? styles.profileWrapperActive : null]}>
          {profileImage ? (
            <Image source={profileImage} style={styles.profileImage as any} />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <TabBarIcon name="user" size={24} color={color.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{"Bonjour,"}</Text>
          <Text style={styles.userName} numberOfLines={1}>{fullName}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.headerAction}
        onPress={() => router.push("/(tabs)/alertes")}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("home.alertsLabel") || "Alertes"}
      >
        <View style={[styles.iconCircle, hasActiveAlerts ? styles.iconCircleActive : styles.iconCircleIdle]}>
          <TabBarIcon
            name="bell-o"
            size={22}
            color={hasActiveAlerts ? color.primary : color.secondary}
          />
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
    backgroundColor: color.background,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  profileWrapper: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
  },
  profileWrapperActive: {
    borderColor: color.primary,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.secondaryGhost,
  },
  profilePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: color.textSecondary,
    fontWeight: "400",
    fontStyle: "italic",
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: color.text,
    letterSpacing: 0,
  },
  headerAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: color.radius.l,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircleActive: {
    backgroundColor: color.primaryGhost,
    borderWidth: 1,
    borderColor: color.primaryLight,
  },
  iconCircleIdle: {
    backgroundColor: color.secondaryGhost,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.primary,
    borderWidth: 2.5,
    borderColor: "white",
  },
});
