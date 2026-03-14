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
  import React, { useEffect, useRef } from "react";
  import { View, StyleSheet, Animated, Text, ViewStyle } from "react-native";
  import { color } from "@/constant/color";

  interface ModernSpinnerProps {
    size?: "small" | "medium" | "large";
    color?: string;
    message?: string;
    style?: ViewStyle;
    mascot?: string; // emoji or short text used as mascot
  }

  export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
    size = "medium",
    color: spinnerColor = color.primary,
    message,
    style,
    mascot = "🩸",
  }) => {
    const bounce = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bounce, { toValue: -8, duration: 450, useNativeDriver: true }),
            Animated.timing(bounce, { toValue: 0, duration: 450, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(rotate, { toValue: 1, duration: 2000, useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.07, duration: 600, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1.0, duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    }, [bounce, rotate, scale]);

    const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ["-6deg", "6deg"] });

    const sizeMap = { small: 40, medium: 64, large: 96 };
    const mascSize = sizeMap[size];

    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.mascotWrapper,
            {
              width: mascSize,
              height: mascSize,
              transform: [{ translateY: bounce }, { rotate: rotation }, { scale }],
              backgroundColor: spinnerColor + "20",
            },
          ]}
        >
          <Text style={[styles.mascot, { fontSize: Math.round(mascSize * 0.5) }]}>{mascot}</Text>
        </Animated.View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    mascotWrapper: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 999,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
    mascot: {
      textAlign: "center",
    },
    message: {
      fontSize: 13,
      fontWeight: "500",
      color: color.textSecondary,
      textAlign: "center",
      marginTop: 4,
    },
  });
          <Animated.View
