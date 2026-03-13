import { useContext } from "react";
import { NotificationContext } from "@/context/NotificationContext";

/**
 * Hook for accessing notification methods
 * Must be used within NotificationProvider
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used within NotificationProvider. " +
        "Make sure NotificationProvider wraps your component.",
    );
  }

  return context;
};
