/**
 * Toast Service - Native React Native Implementation
 * No external dependencies required - uses native APIs
 */

import { ToastAndroid, Alert, Platform } from "react-native";

export type ToastType = "success" | "error" | "warning" | "info" | "danger";

interface ToastOptions {
  duration?: number;
  position?: "top" | "center" | "bottom";
  type?: ToastType;
}

/**
 * Show a native toast notification
 * Uses ToastAndroid on Android, Alert on iOS
 */
export const showToast = (
  message: string,
  options: ToastOptions = {},
): void => {
  const { duration = 3000, type = "info" } = options;

  if (Platform.OS === "android") {
    // Use native Android Toast
    ToastAndroid.show(
      message,
      duration > 3500 ? ToastAndroid.LONG : ToastAndroid.SHORT,
    );
  } else {
    // On iOS, we could use a simple alert or a custom toast component
    // For now, using a minimal approach with logging
    console.log(`[${type.toUpperCase()}]: ${message}`);
  }
};

/**
 * Show success toast
 */
export const showSuccessToast = (
  message: string,
  duration: number = 3000,
): void => {
  showToast(message, { type: "success", duration });
};

/**
 * Show error toast
 */
export const showErrorToast = (
  message: string,
  duration: number = 4000,
): void => {
  showToast(message, { type: "error", duration });
};

/**
 * Show warning toast
 */
export const showWarningToast = (
  message: string,
  duration: number = 3500,
): void => {
  showToast(message, { type: "warning", duration });
};

/**
 * Show info toast
 */
export const showInfoToast = (
  message: string,
  duration: number = 3000,
): void => {
  showToast(message, { type: "info", duration });
};

/**
 * Show alert modal
 */
export const showAlert = (
  title: string,
  message: string,
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }> = [{ text: "OK" }],
): void => {
  Alert.alert(title, message, buttons);
};

export default {
  showToast,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showAlert,
};
