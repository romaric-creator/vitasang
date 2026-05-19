import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, Animated } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";

interface PulseButtonProps {
  onPress: () => void;
  loading: boolean;
  title: string;
}

export const PulseButton = ({ onPress, loading, title }: PulseButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "100%" }}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
        onPress={onPress}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <TabBarIcon name="check-circle" size={20} color="white" />
        <Text style={styles.primaryBtnText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: color.primary,
    padding: 20,
    borderRadius: color.radius.l,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: color.primaryDark,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
