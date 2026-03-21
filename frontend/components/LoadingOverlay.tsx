import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ModernSpinner } from "./ModernSpinner";
import { color } from "@/constant/color";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  spinnerSize?: "small" | "medium" | "large";
  spinnerColor?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
  pose?: "waving" | "jumping" | "superhero";
}

/**
 * Composant de chargement réutilisable
 * Centralise le style et le comportement du spinner
 * Utiliser PARTOUT au lieu de ActivityIndicator ou modèles custom
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  spinnerSize = "large",
  spinnerColor = color.primary,
  style,
  fullScreen = false,
  pose = 'heart-pulse',
}) => {
  if (!visible) return null;

  return (
    <View style={[fullScreen ? styles.fullScreen : styles.container, style]}>
      <View style={styles.content}>
        <ModernSpinner
          size={spinnerSize}
          color={spinnerColor}
          message={message}
          pose={pose as any}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Plus clair et premium
    zIndex: 999,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
});
