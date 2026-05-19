import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Animated } from "react-native";
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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handlePress = () => {
    console.log("[LaunchAlertButton] Redirecting, isAuth:", isAuth);
    if (isAuth) {
      router.push("/create-alert");
    } else {
      router.push("/guest-alert");
    }
  };

  return (
    <Animated.View style={[styles.animatedWrapper, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t("home.launchAlert")}
      >
        {/* Overlay gradient simulé */}
        <View style={styles.overlayBottom} pointerEvents="none" />

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconEmoji}>🩸</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.text}>{t("home.launchAlert")}</Text>
            <Text style={styles.subtitle}>{"Don de sang urgent • Besoin maintenant"}</Text>
          </View>
          <View style={styles.arrowWrapper}>
            <TabBarIcon name="arrow-right" size={16} color="white" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedWrapper: {
    marginBottom: 24,
  },
  container: {
    borderRadius: 24,
    backgroundColor: color.primary,
    borderWidth: 1,
    borderColor: color.primaryLight,
    shadowColor: color.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconEmoji: {
    fontSize: 24,
  },
  textBlock: {
    flex: 1,
  },
  text: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
  },
  subtitle: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
    marginTop: 3,
    fontWeight: "400",
  },
  arrowWrapper: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
});
