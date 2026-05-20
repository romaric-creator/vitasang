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

export const HomeHeader = React.memo(({ fullName, profileImage, hasActiveAlerts, t }: HomeHeaderProps) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={[styles.profileWrapper, profileImage ? styles.profileWrapperActive : null]}>
          {profileImage ? (
            <Image source={profileImage} style={styles.profileImage as any} />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <TabBarIcon name="user" size={22} color={color.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.userName} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.tagline}>{t("home.tagline")}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.headerAction}
        onPress={() => router.push("/(tabs)/alertes")}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("home.alertsLabel")}
      >
        <View style={[styles.iconCircle, hasActiveAlerts ? styles.iconCircleActive : styles.iconCircleIdle]}>
          <TabBarIcon
            name="bell-o"
            size={20}
            color={hasActiveAlerts ? color.primary : color.textSecondary}
          />
          {hasActiveAlerts && <View style={styles.badge} />}
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  profileWrapper: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "transparent",
  },
  profileWrapperActive: {
    borderColor: color.primary,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.surfaceContainer,
  },
  profilePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: color.text,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 13,
    color: color.textLight,
    fontWeight: "500",
    marginTop: 2,
  },
  headerAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleActive: {
    backgroundColor: color.primaryGhost,
    borderWidth: 1.5,
    borderColor: color.primaryLight,
  },
  iconCircleIdle: {
    backgroundColor: color.surfaceContainer,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: color.error,
    borderWidth: 2,
    borderColor: "white",
  },
});
