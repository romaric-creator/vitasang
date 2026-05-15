import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

interface LaunchAlertButtonProps {
  t: (key: string) => string;
}

export const LaunchAlertButton = ({ t }: LaunchAlertButtonProps) => {
  const router = useRouter();
  const { isAuth } = useAuth();

  const handlePress = () => {
    console.log("[LaunchAlertButton] Redirecting, isAuth:", isAuth);
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
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <TabBarIcon name="bolt" size={26} color="white" />
        </View>
        <Text style={styles.text}>{t("home.launchAlert")}</Text>
        <View style={styles.arrowWrapper}>
          <TabBarIcon name="arrow-right" size={16} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 36,
    borderRadius: 28,
    backgroundColor: "white",
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: color.primary, // Red icon for pulse/urgency
    justifyContent: "center",
    alignItems: "center",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  text: {
    flex: 1,
    color: color.secondaryDark,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  arrowWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.secondaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
});


