import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { TabBarIcon } from "./TabBarIcon";
import { color } from "@/constant/color";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertToastProps {
  visible: boolean;
  type: AlertType;
  message: string;
  title?: string;
  duration?: number;
  onDismiss?: () => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({
  visible,
  type,
  message,
  title,
  duration = 4000,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!visible) return null;

  const typeStyles = {
    success: {
      backgroundColor: color.successLight,
      borderColor: color.success,
      iconColor: color.success,
      textColor: color.success,
    },
    error: {
      backgroundColor: color.dangerLight,
      borderColor: color.error,
      iconColor: color.error,
      textColor: color.error,
    },
    warning: {
      backgroundColor: color.warningLight,
      borderColor: color.warning,
      iconColor: color.warning,
      textColor: color.warning,
    },
    info: {
      backgroundColor: color.infoLight,
      borderColor: color.info,
      iconColor: color.info,
      textColor: color.info,
    },
  };

  const style = typeStyles[type];
  const iconMap: Record<
    AlertType,
    React.ComponentProps<typeof TabBarIcon>["name"]
  > = {
    success: "check-circle",
    error: "times-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
          },
        ]}
      >
        <TabBarIcon name={iconMap[type]} size={22} color={style.iconColor} />
        <View style={styles.content}>
          {title && (
            <Text style={[styles.title, { color: color.textMain }]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, { color: color.textSecondary }]}>
            {message}
          </Text>
        </View>
        <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
          <TabBarIcon name="times" size={18} color={color.textLight} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    // Soft UI Evolution: Shadow moderne et douce
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
});
