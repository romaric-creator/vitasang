import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { color } from "@/constant/color";
import { TabBarIcon } from "./TabBarIcon";
import { useTranslation } from "react-i18next";

interface ErrorAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
  type?: "error" | "warning" | "info";
}

export const ErrorAlert = ({
  visible,
  title,
  message,
  onDismiss,
  onRetry,
  type = "error",
}: ErrorAlertProps) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible) return null;

  const displayTitle =
    title ||
    (type === "error"
      ? t("common.errors.error")
      : type === "warning"
        ? t("common.errors.warning")
        : t("common.errors.info"));

  const colors = {
    error: {
      bg: color.dangerLight,
      accent: color.error,
      text: color.error,
      icon: "exclamation-circle" as const,
    },
    warning: {
      bg: color.warningLight,
      accent: color.warning,
      text: "#92400E",
      icon: "exclamation-triangle" as const,
    },
    info: {
      bg: color.infoLight,
      accent: color.info,
      text: "#1E40AF",
      icon: "info-circle" as const,
    },
  }[type];

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
      testID="error-alert-container"
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: "white" }]}>
              <TabBarIcon name={colors.icon} color={colors.accent} size={20} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {displayTitle}
            </Text>
          </View>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {onRetry && (
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.retryText}>{t("common.errors.retry")}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessible={true}
            >
              <Text style={styles.dismissText}>{t("common.errors.ok")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { paddingHorizontal: 16, marginVertical: 12 },
  container: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    flexDirection: "row",
  },
  accentBar: { width: 6 },
  contentContainer: { flex: 1, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: { fontSize: 18, fontWeight: "900", flex: 1, letterSpacing: -0.5 },
  message: {
    fontSize: 15,
    color: color.textMain,
    marginBottom: 18,
    lineHeight: 22,
    fontWeight: "500",
  },
  actions: { flexDirection: "row", gap: 10 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: { backgroundColor: color.primary },
  retryText: { color: "white", fontWeight: "800", fontSize: 14 },
  dismissButton: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  dismissText: { color: color.textMain, fontWeight: "700", fontSize: 14 },
});
