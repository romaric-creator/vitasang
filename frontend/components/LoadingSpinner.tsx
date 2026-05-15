import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { color } from "@/constant/color";
import { ModernSpinner } from "@/components/ModernSpinner";

interface LoadingSpinnerProps {
  visible?: boolean;
  size?: "small" | "large";
  color?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export const LoadingSpinner = ({
  visible = true,
  size = "large",
  color: spinnerColor = color.primary,
  accessible = true,
  accessibilityLabel = "Loading",
}: LoadingSpinnerProps) => {
  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.container}
      testID="loading-spinner-container"
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.spinnerContainer}>
        <ModernSpinner
          size={size === "small" ? "small" : "medium"}
          color={spinnerColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.3)",
    zIndex: 1000,
  },
  spinnerContainer: {
    backgroundColor: color.surface,
    borderRadius: 12,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
    minHeight: 100,
    // Soft UI Evolution: Shadow moderne
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});
