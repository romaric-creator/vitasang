import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
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
  accessibilityLabel = "Chargement en cours",
}: LoadingSpinnerProps) => {
  const [tipIndex, setTipIndex] = React.useState(0);
  const tips = [
    "Un don de sang peut sauver jusqu'à 3 vies.",
    "Votre action compte. Merci de votre patience.",
    "Vos données médicales sont sécurisées.",
    "Traitement en cours, merci...",
  ];

  React.useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible]);

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
        {size === "large" && (
          <Text style={styles.tipText}>{tips[tipIndex]}</Text>
        )}
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
  tipText: {
    marginTop: 16,
    color: color.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
