/**
 * In-App Notification Service
 * Affiche des notifications quand l'utilisateur est sur l'app
 * Alternative aux push notifications
 */

import React, { createContext, useState, useCallback, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "alert";

export interface ShowOptions {
  title?: string;
  duration?: number; // 0 = persistent, ms for auto-dismiss
  action?: {
    text: string;
    onPress: () => void;
  };
}

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    text: string;
    onPress: () => void;
  };
}

interface NotificationContextType {
  show: (
    type: NotificationType,
    message: string,
    options?: ShowOptions,
  ) => void;
  dismiss: (id: string) => void;
  showSuccess: (message: string, options?: ShowOptions) => void;
  showError: (message: string, options?: ShowOptions) => void;
  showWarning: (message: string, options?: ShowOptions) => void;
  showAlert: (message: string, options?: ShowOptions) => void;
  showInfo: (message: string, options?: ShowOptions) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

/**
 * Provider pour les notifications in-app
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const show = useCallback(
    (type: NotificationType, message: string, options?: ShowOptions) => {
      const id = `${Date.now()}-${Math.random()}`;
      const duration = options?.duration ?? (type === "alert" ? 0 : 4000);

      const fullNotification: InAppNotification = {
        id,
        type,
        title: options?.title,
        message,
        duration,
        action: options?.action,
      };

      setNotifications((prev) => [...prev, fullNotification]);

      // Auto dismiss après duration
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, options?: ShowOptions) => {
      show("success", message, {
        title: "Succès",
        ...options,
        duration: options?.duration ?? 3000,
      });
    },
    [show],
  );

  const showError = useCallback(
    (message: string, options?: ShowOptions) => {
      show("error", message, {
        title: "Erreur",
        ...options,
        duration: options?.duration ?? 4000,
      });
    },
    [show],
  );

  const showWarning = useCallback(
    (message: string, options?: ShowOptions) => {
      show("warning", message, {
        ...options,
        duration: options?.duration ?? 3500,
      });
    },
    [show],
  );

  const showAlert = useCallback(
    (message: string, options?: ShowOptions) => {
      show("alert", message, { ...options, duration: 0 });
    },
    [show],
  );

  const showInfo = useCallback(
    (message: string, options?: ShowOptions) => {
      show("info", message, {
        ...options,
        duration: options?.duration ?? 3000,
      });
    },
    [show],
  );

  return (
    <NotificationContext.Provider
      value={{
        show,
        dismiss,
        showSuccess,
        showError,
        showWarning,
        showAlert,
        showInfo,
      }}
    >
      {children}
      <NotificationStack notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

/**
 * Hook pour utiliser les notifications
 */
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

/**
 * Composant d'affichage des notifications
 */
const NotificationStack: React.FC<{
  notifications: InAppNotification[];
  onDismiss: (id: string) => void;
}> = ({ notifications, onDismiss }) => {
  return (
    <View style={styles.stack}>
      {notifications.map((notification, index) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          index={index}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </View>
  );
};

/**
 * Composant d'une notification individuelle
 */
const NotificationCard: React.FC<{
  notification: InAppNotification;
  index: number;
  onDismiss: () => void;
}> = ({ notification, index, onDismiss }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.85));
  const [slideAnim] = React.useState(new Animated.Value(-100));
  const [progressAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    // Animation d'entrée fluide avec spring
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Barre de progression si durée définie
    if (notification.duration && notification.duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: notification.duration,
        useNativeDriver: false,
      }).start(() => {
        // Animation de sortie
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 0.9,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [fadeAnim, scaleAnim, slideAnim, progressAnim, notification.duration]);

  const getNotificationColors = (type: NotificationType) => {
    switch (type) {
      case "success":
        return {
          bg: "rgba(232, 255, 243, 0.95)",
          border: "#10B981",
          light: "#D1FAE5",
          icon: "check-circle",
          iconColor: "#059669",
          iconBg: "rgba(16, 185, 129, 0.15)",
        };
      case "error":
        return {
          bg: "rgba(255, 241, 242, 0.95)",
          border: "#F43F5E",
          light: "#FFE4E6",
          icon: "exclamation-circle",
          iconColor: "#E11D48",
          iconBg: "rgba(244, 63, 94, 0.15)",
        };
      case "warning":
        return {
          bg: "rgba(255, 251, 235, 0.95)",
          border: "#F59E0B",
          light: "#FEF3C7",
          icon: "exclamation-triangle",
          iconColor: "#D97706",
          iconBg: "rgba(245, 158, 11, 0.15)",
        };
      case "alert":
        return {
          bg: "rgba(255, 241, 241, 0.95)",
          border: color.primary,
          light: "#FFE4E6",
          icon: "bell",
          iconColor: color.primary,
          iconBg: "rgba(231, 76, 60, 0.15)",
        };
      default:
        return {
          bg: "rgba(239, 246, 255, 0.95)",
          border: "#3B82F6",
          light: "#DBEAFE",
          icon: "info-circle",
          iconColor: "#2563EB",
          iconBg: "rgba(59, 130, 246, 0.15)",
        };
    }
  };

  const colors = getNotificationColors(notification.type);

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
          marginTop: index * 12,
        },
      ]}
    >
      <View
        style={[
          styles.notificationContent,
          { backgroundColor: colors.bg, borderColor: colors.border },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.iconBg }]}>
          <TabBarIcon name={colors.icon as any} size={20} color={colors.iconColor} />
        </View>

        <View style={styles.textBox}>
          {notification.title && (
            <Text style={styles.title}>{notification.title}</Text>
          )}
          <Text
            style={styles.message}
            numberOfLines={notification.title ? 2 : 3}
          >
            {notification.message}
          </Text>
        </View>

        {notification.action && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => {
              notification.action?.onPress();
              onDismiss();
            }}
          >
            <Text style={[styles.actionText, { color: colors.border }]}>
              {notification.action.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Barre de progression */}
      {notification.duration && notification.duration > 0 && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.border,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["100%", "0%"],
              }),
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stack: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  notification: {
    width: "100%",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    borderRadius: 12,
  },
  textBox: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressBar: {
    height: 2,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});
