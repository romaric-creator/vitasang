import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, ViewStyle, Easing } from "react-native";
import { color } from "@/constant/color";
import { TabBarIcon } from "./TabBarIcon";

interface ModernSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  message?: string;
  style?: ViewStyle;
  pose?: "spinning" | "bouncing" | "heart-pulse";
}

export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = "medium",
  color: spinnerColor = color.primary,
  message,
  style,
  pose = "spinning",
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation Loop (Standard)
    const rotateAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Heart Pulse Loop
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );

    // Bounce Loop
    const bounceAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    rotateAnim.start();
    if (pose === "heart-pulse") pulseAnim.start();
    if (pose === "bouncing") bounceAnim.start();

    return () => {
      rotateAnim.stop();
      pulseAnim.stop();
      bounceAnim.stop();
    };
  }, [rotation, pulse, bounce, pose]);

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
            transform: [
              { rotate: pose === "heart-pulse" ? "0deg" : spin },
              { translateY: pose === "bouncing" ? bounce : 0 },
              { scale: pose === "heart-pulse" ? pulse : 1 },
            ],
          },
        ]}
      >
        {pose === "heart-pulse" ? (
          <TabBarIcon name="heart" size={spinnerSize * 0.8} color={spinnerColor} />
        ) : (
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
        )}
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
