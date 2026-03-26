import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface LaunchAlertButtonProps {
  t: (key: string) => string;
}

export const LaunchAlertButton = ({ t }: LaunchAlertButtonProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.mainActionBtn}
      onPress={() => {
        console.log("[LaunchAlertButton] Redirecting to /create-alert");
        router.push("/create-alert" as any);
      }}
    >
      <View style={styles.mainActionGradient}>
        <TabBarIcon name="bolt" size={24} color="white" />
        <Text style={styles.mainActionText}>{t("home.launchAlert")}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainActionBtn: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 12,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  mainActionGradient: {
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  mainActionText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
