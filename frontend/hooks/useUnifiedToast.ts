import { useState, useCallback, useRef } from "react";
import { ToastType } from "@/components/UnifiedToast";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  persistent?: boolean;
}

let toastIdCounter = 0;

const generateId = () => {
  toastIdCounter += 1;
  return `toast_${Date.now()}_${toastIdCounter}`;
};

export const useUnifiedToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      options?: {
        duration?: number;
        action?: { label: string; onPress: () => void };
        persistent?: boolean;
      }
    ) => {
      const id = generateId();
      const newToast: ToastItem = {
        id,
        message,
        type,
        duration: options?.duration,
        action: options?.action,
        persistent: options?.persistent ?? false,
      };

      setToasts((prev) => [...prev, newToast]);

      if (!newToast.persistent) {
        const duration = newToast.duration ?? (type === "success" ? 3000 : type === "error" ? 5000 : type === "warning" ? 4000 : 3500);
        
        const timeout = setTimeout(() => {
          dismissToast(id);
        }, duration);

        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) =>
      showToast(message, "success", options),
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) =>
      showToast(message, "error", options),
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) =>
      showToast(message, "warning", options),
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) =>
      showToast(message, "info", options),
    [showToast]
  );

  const clearAll = useCallback(() => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    dismissToast,
    clearAll,
  };
};

export default useUnifiedToast;