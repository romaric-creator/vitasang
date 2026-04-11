import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, ViewStyle, Easing } from "react-native";
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
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateAnim.start();
    return () => rotateAnim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinnerSize = size === "small" ? 24 : size === "medium" ? 48 : 80;

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        testID="activity-indicator"
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            transform: [{ rotate: spin }],
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
              borderTopColor: "transparent",
            },
          ]}
        />
      </Animated.View>

      {message ? (
        <Text style={[styles.message, { color: spinnerColor }]}>{message}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerRing: {
    borderWidth: 3,
    borderRadius: 50,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
