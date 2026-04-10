import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { color } from "@/constant/color";
import { TabBarIcon } from "./TabBarIcon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type ToastType = "success" | "error" | "warning" | "info";

interface UnifiedToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  persistent?: boolean;
}

const TOAST_CONFIG = {
  success: {
    bg: color.successLight,
    accent: color.success,
    text: color.textMain,
    textSecondary: "#065F46",
    icon: "check-circle" as const,
    defaultDuration: 3000,
  },
  error: {
    bg: color.dangerLight,
    accent: color.error,
    text: color.textMain,
    textSecondary: "#9F1239",
    icon: "times-circle" as const,
    defaultDuration: 5000,
  },
  warning: {
    bg: color.warningLight,
    accent: color.warning,
    text: color.textMain,
    textSecondary: "#92400E",
    icon: "exclamation-triangle" as const,
    defaultDuration: 4000,
  },
  info: {
    bg: color.infoLight,
    accent: color.info,
    text: color.textMain,
    textSecondary: "#1E40AF",
    icon: "info-circle" as const,
    defaultDuration: 3500,
  },
};

export const UnifiedToast = ({
  visible,
  message,
  type = "info",
  duration,
  onDismiss,
  action,
  persistent = false,
}: UnifiedToastProps) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  const config = TOAST_CONFIG[type];
  const dismissDuration = duration ?? config.defaultDuration;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  }, [slideAnim, opacityAnim, onDismiss]);

  useEffect(() => {
    if (visible) {
      animateIn();
      
      if (!persistent && dismissDuration > 0) {
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: dismissDuration,
          useNativeDriver: false,
        }).start();
        
        const timer = setTimeout(() => {
          animateOut();
        }, dismissDuration);

        return () => clearTimeout(timer);
      }
    } else {
      animateOut();
    }
  }, [visible, animateIn, animateOut, dismissDuration, persistent]);

  if (!visible && opacityAnim._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: config.bg }]}>
        <View style={[styles.accentBar, { backgroundColor: config.accent }]} />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <TabBarIcon name={config.icon} color={config.accent} size={22} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: config.text }]} numberOfLines={3}>
              {message}
            </Text>
          </View>
          {action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionText, { color: config.accent }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          )}
          {!persistent && onDismiss && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={animateOut}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <TabBarIcon name="times" color={color.textSecondary} size={16} />
            </TouchableOpacity>
          )}
        </View>
        {!persistent && (
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: config.accent,
                opacity: 0.3,
              },
            ]}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  accentBar: {
    width: 5,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 5,
    right: 0,
    height: 3,
  },
});

export default UnifiedToast;