import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Splash({
  showButtons = true,
}: {
  showButtons?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.appName}>VitaSang</Text>
        <Text style={styles.tagline}>{t("home.tagline")}</Text>
      </View>

      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/OnboardingCarousel")}
          >
            <Text style={styles.primaryButtonText}>{t("common.actions.start")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    height: 180,
    width: 160,
    resizeMode: "contain",
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: color.background,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: color.background,
    paddingHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    color: color.primary,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderColor: color.background,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: color.background,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
