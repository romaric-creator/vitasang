import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Text,
  ViewStyle,
} from "react-native";
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
  const [rotation] = useState(new Animated.Value(0));
  const [scale1] = useState(new Animated.Value(1));
  const [scale2] = useState(new Animated.Value(1));
  const [scale3] = useState(new Animated.Value(1));

  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const dotRadius = sizeMap[size] / 4;

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Pulsing animations for dots
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.3,
            duration: 600,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
    };

    createPulseAnimation(scale1, 0).start();
    createPulseAnimation(scale2, 200).start();
    createPulseAnimation(scale3, 400).start();
  }, [rotation, scale1, scale2, scale3]);

  const rotationInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.spinnerWrapper,
          { width: sizeMap[size], height: sizeMap[size] },
        ]}
      >
        {/* Rotating outer ring */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: sizeMap[size],
              height: sizeMap[size],
              borderRadius: sizeMap[size] / 2,
              borderWidth: 3,
              borderColor: spinnerColor,
              borderTopColor: "transparent",
              borderRightColor: "transparent",
              transform: [{ rotate: rotationInterpolate }],
            },
          ]}
        />

        {/* Pulsing center dots */}
        <View
          style={[
            styles.dotsContainer,
            {
              width: sizeMap[size] * 0.5,
              height: sizeMap[size] * 0.5,
            },
          ]}
        >
          {/* Dot 1 */}
          <Animated.View
            style={[
              styles.dot,
              {
                width: dotRadius,
                height: dotRadius,
                borderRadius: dotRadius / 2,
                backgroundColor: spinnerColor,
                transform: [{ scale: scale1 }],
                opacity: 0.8,
              },
            ]}
          />

          {/* Dot 2 */}
          <Animated.View
            style={[
              styles.dot,
              {
                width: dotRadius,
                height: dotRadius,
                borderRadius: dotRadius / 2,
                backgroundColor: spinnerColor,
                transform: [{ scale: scale2 }],
                opacity: 0.6,
              },
            ]}
          />

          {/* Dot 3 */}
          <Animated.View
            style={[
              styles.dot,
              {
                width: dotRadius,
                height: dotRadius,
                borderRadius: dotRadius / 2,
                backgroundColor: spinnerColor,
                transform: [{ scale: scale3 }],
                opacity: 0.4,
              },
            ]}
          />
        </View>
      </View>

      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  spinnerWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  outerRing: {
    position: "absolute",
  },
  dotsContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    flexShrink: 0,
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
    color: color.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});
