import React, { createContext, useContext, ReactNode } from "react";
import { useUnifiedToast } from "@/hooks/useUnifiedToast";
import UnifiedToast, { ToastType } from "@/components/UnifiedToast";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: {
    duration?: number;
    action?: { label: string; onPress: () => void };
    persistent?: boolean;
  }) => string;
  success: (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) => string;
  error: (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) => string;
  warning: (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) => string;
  info: (message: string, options?: { duration?: number; action?: { label: string; onPress: () => void } }) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const toastMethods = useUnifiedToast();

  const value: ToastContextValue = {
    ...toastMethods,
    showToast: toastMethods.showToast,
    success: toastMethods.success,
    error: toastMethods.error,
    warning: toastMethods.warning,
    info: toastMethods.info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastMethods.toasts.map((toast) => (
        <UnifiedToast
          key={toast.id}
          visible={true}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          action={toast.action}
          persistent={toast.persistent}
          onDismiss={() => toastMethods.dismissToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;