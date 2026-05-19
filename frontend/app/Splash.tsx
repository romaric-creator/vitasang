import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "@/components/PrimaryButton";

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
          accessible={false}
        />
        <Text style={styles.appName}>VitaSang</Text>
        <Text style={styles.tagline}>{t("home.tagline")}</Text>
      </View>

      {showButtons && (
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={t("common.actions.start")}
            onPress={() => router.push("/OnboardingCarousel")}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.secondary,
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
    height: 160,
    width: 160,
    resizeMode: "contain",
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: color.textWhite,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: color.textWhite,
    fontWeight: "600",
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
});
