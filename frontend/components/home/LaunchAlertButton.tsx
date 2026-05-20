import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

interface LaunchAlertButtonProps {
  t: (key: string) => string;
}

export const LaunchAlertButton = React.memo(({ t }: LaunchAlertButtonProps) => {
  const router = useRouter();
  const { isAuth } = useAuth();

  const handlePress = () => {
    if (isAuth) {
      router.push("/create-alert");
    } else {
      router.push("/guest-alert");
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t("home.launchAlert")}
    >
      {/* Top highlight overlay */}
      <View style={styles.overlayTop} pointerEvents="none" />

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.iconWrapper}>
            <TabBarIcon name="plus" size={20} color="white" />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.text}>{t("home.launchAlert")}</Text>
            <Text style={styles.subtitle}>{t("home.launchAlertSubtitle")}</Text>
          </View>
        </View>
        <View style={styles.arrowWrapper}>
          <TabBarIcon name="arrow-right" size={14} color={color.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: color.spacing.m,
    borderRadius: color.radius.xl,
    backgroundColor: color.primaryDark,
    shadowColor: color.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textBlock: {
    flex: 1,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "500",
  },
  arrowWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
