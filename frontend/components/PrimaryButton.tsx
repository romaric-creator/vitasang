import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
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
  accessibilityLabel?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  type = "primary",
  accessibilityLabel,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
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
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessible={true}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
      >
        {loading ? (
          <ModernSpinner size="small" color={getTextColor()} />
        ) : (
          <Text
            style={[styles.buttonText, { color: getTextColor() }, textStyle]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    // Soft UI Evolution: Ombres douces modernes
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0.08,
    elevation: 1,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
