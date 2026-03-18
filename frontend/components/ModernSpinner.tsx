import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, ViewStyle } from "react-native";
import { color } from "@/constant/color";

interface ModernSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  message?: string;
  style?: ViewStyle;
}

export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = "medium",
  color: spinnerColor = color.primary,
  message,
  style,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation - smooth spinning
    const spinAnim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    );

    // Pulse animation - fade in/out
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    spinAnim.start();
    pulseAnim.start();

    return () => {
      spinAnim.stop();
      pulseAnim.stop();
    };
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const sizeMap: Record<string, number> = { small: 48, medium: 64, large: 80 };
  const spinnerSize = sizeMap[size];

  return (
    <View style={[styles.container, style]}>
      {/* Simple rotating spinner - no SVG complexity */}
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            transform: [{ rotate: spin }],
            opacity: pulseValue,
          },
        ]}
      >
        <View
          style={[
            styles.spinnerRing,
            {
              borderColor: spinnerColor,
              width: spinnerSize,
              height: spinnerSize,
            },
          ]}
        />
      </Animated.View>

      {/* Message optionnel */}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  spinner: {
    justifyContent: "center",
    alignItems: "center",
  },

  spinnerRing: {
    borderWidth: 4,
    borderRadius: 999,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },

  message: {
    fontSize: 13,
    fontWeight: "500",
    color: color.textSecondary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
