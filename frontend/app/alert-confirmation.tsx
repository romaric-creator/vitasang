import React, { useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { color } from "@/constant/color";
import { useRouter, useLocalSearchParams } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { TabBarIcon } from "@/components/TabBarIcon";

export default function AlertConfirmationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { alertId } = useLocalSearchParams<{ alertId: string }>();

  useEffect(() => {
    if (!alertId) {
      router.replace("/(tabs)");
      return;
    }

    // Auto-redirect après 2.5 secondes
    const timer = setTimeout(() => {
      router.replace({
        pathname: "/alert-tracking/[id]",
        params: { id: alertId },
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [alertId, router]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Heart Icon */}
        <View style={styles.iconContainer}>
          <TabBarIcon name="heart" size={80} color={color.primary} />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>
          {t("alert.confirmation.title")}
        </Text>
        <Text style={styles.subtitle}>
          {t("alert.confirmation.message")}
        </Text>

        {/* Loading Spinner */}
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <TouchableOpacity
            style={styles.bypassButton}
            onPress={() => {
              if (alertId) {
                router.replace({
                  pathname: "/alert-tracking/[id]",
                  params: { id: alertId },
                });
              }
            }}
          >
            <Text style={styles.bypassText}>
              {t("alert.confirmation.bypass") || "Passer l'attente"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {t("alert.confirmation.info")}
          </Text>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.screenBackground,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: color.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: color.textMain,
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
  spinnerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  bypassButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  bypassText: {
    color: color.primary,
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  infoBox: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    maxWidth: 300,
  },
  infoText: {
    fontSize: 12,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    fontWeight: "500",
  },
});
