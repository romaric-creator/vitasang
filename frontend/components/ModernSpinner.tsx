import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, ViewStyle } from "react-native";
import { color } from "@/constant/color";

interface ModernSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  message?: string;
  style?: ViewStyle;
  pose?: "waving" | "jumping" | "superhero" | "bouncing";
}

export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = "medium",
  color: spinnerColor = color.primary,
  message,
  style,
  pose = "waving",
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

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

    // Bouncing animation
    const bouncingAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -15,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );

    // Scale pulse animation
    const scaleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    spinAnim.start();
    pulseAnim.start();

    if (pose === "bouncing") {
      bouncingAnim.start();
    } else if (pose === "jumping") {
      scaleAnim.start();
    }

    return () => {
      spinAnim.stop();
      pulseAnim.stop();
      bouncingAnim.stop();
      scaleAnim.stop();
    };
  }, [spinValue, pulseValue, translateY, scaleValue, pose]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const sizeMap: Record<string, number> = { small: 48, medium: 64, large: 80 };
  const spinnerSize = sizeMap[size];

  return (
    <View style={[styles.container, style]}>
      {/* Enhanced rotating spinner with gradient effect */}
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            transform: [
              { rotate: spin },
              { translateY },
              { scale: scaleValue },
            ],
            opacity: pulseValue,
          },
        ]}
      >
        {/* Outer ring */}
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
        {/* Inner ring for depth */}
        <View
          style={[
            styles.innerRing,
            {
              borderColor: spinnerColor,
              width: spinnerSize * 0.6,
              height: spinnerSize * 0.6,
            },
          ]}
        />
      </Animated.View>

      {/* Pulsing dots under spinner */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: spinnerColor,
                opacity: Animated.add(pulseValue, i * 0.2),
              },
            ]}
          />
        ))}
      </View>

      {/* Message optionnel */}
      {message ? (
        <Text style={[styles.message, { color: spinnerColor }]}>{message}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  spinner: {
    justifyContent: "center",
    alignItems: "center",
  },

  spinnerRing: {
    borderWidth: 3,
    borderRadius: 999,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    position: "absolute",
  },

  innerRing: {
    borderWidth: 2,
    borderRadius: 999,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    opacity: 0.5,
  },

  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  message: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
    marginTop: 8,
  },
});
