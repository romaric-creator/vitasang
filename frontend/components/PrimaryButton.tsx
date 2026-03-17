import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ModernSpinner } from "@/components/ModernSpinner";
import { color } from "@/constant/color";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  type?: "primary" | "secondary" | "danger";
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  type = "primary",
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case "secondary":
        return color.surface;
      case "danger":
        return color.error;
      case "primary":
      default:
        return color.primary;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "secondary":
        return color.primary;
      case "danger":
      case "primary":
      default:
        return color.textWhite;
    }
  };

  const getShadowColor = () => {
    switch (type) {
      case "secondary":
        return "transparent";
      case "danger":
        return color.error;
      case "primary":
      default:
        return color.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.mainButton,
        {
          backgroundColor: getBackgroundColor(),
          shadowColor: getShadowColor(),
          borderColor: type === "secondary" ? color.border : "transparent",
          borderWidth: type === "secondary" ? 1 : 0,
        },
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ModernSpinner size="small" color={getTextColor()} />
      ) : (
        <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
