import { useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";
import { AlertRetryManager } from "@/services/alertRetryService";

const RETRY_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * Hook to periodically check for alerts ready for retry
 * and display them as in-app notifications
 *
 * Usage: Call this hook once in your app layout or root component
 * Example:
 *   useAlertRetryCheck();
 */
export const useAlertRetryCheck = () => {
  const { showAlert } = useNotification();

  useEffect(() => {
    // Check for alerts on component mount
    const checkAlertsForRetry = async () => {
      try {
        const alertsReadyForRetry =
          await AlertRetryManager.getAlertsReadyForRetry();

        if (alertsReadyForRetry.length > 0) {
          // Mark alerts as retried
          for (const alert of alertsReadyForRetry) {
            await AlertRetryManager.markAlertAsRetried(alert.id);

            // Show notification for each alert
            const message = `${alert.type || "Alerte de don"} - ${alert.location || "Localisation"} est toujours active`;
            showAlert(message, {
              duration: 8000,
              action: {
                text: "Répondre",
                onPress: () => {
                  // Navigate to alert details or response screen
                  // This can be enhanced based on app navigation setup
                },
              },
            });
          }
        }

        // Cleanup expired alerts (older than 24 hours)
        await AlertRetryManager.cleanupExpiredAlerts();
      } catch (error) {
        console.error("Error checking alerts for retry:", error);
      }
    };

    // Check immediately on mount
    checkAlertsForRetry();

    // Set up interval to check every 15 minutes
    const interval = setInterval(checkAlertsForRetry, RETRY_CHECK_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [showAlert]);
};
