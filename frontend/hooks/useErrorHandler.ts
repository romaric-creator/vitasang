import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
  showErrorToast,
  showWarningToast,
  type ToastType,
} from "@/services/toastService";
import {
  type ApiError,
  getUserFriendlyMessage,
  isValidationError,
} from "@/services/errorService";

interface ErrorState {
  error: ApiError | null;
  isLoading: boolean;
  message: string | null;
}

/**
 * Hook for centralized error handling
 * Provides consistent error display and management across the app
 */
export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    message: null,
  });

  /**
   * Handle and display error to user
   */
  const handleError = useCallback(
    (
      error: any,
      options: {
        showToast?: boolean;
        showAlert?: boolean;
        context?: string;
        onRetry?: () => void;
      } = {},
    ) => {
      const {
        showToast: shouldShowToast = true,
        showAlert: shouldShowAlert = false,
        context = "",
        onRetry = null,
      } = options;

      // Ensure we have a proper API error object
      const apiError: ApiError = error?.code
        ? error
        : {
            code: "UNKNOWN_ERROR",
            message:
              error?.message || error?.userMessage || "Une erreur est survenue",
            statusCode: error?.statusCode || 500,
          };

      const userMessage =
        error?.userMessage || getUserFriendlyMessage(apiError);

      // Update error state
      setErrorState({
        error: apiError,
        isLoading: false,
        message: userMessage,
      });

      // Log error for debugging
      if (__DEV__) {
        console.error("[Error Handler]", {
          code: apiError.code,
          message: apiError.message,
          context,
          statusCode: apiError.statusCode,
          details: apiError.details,
        });
      }

      // Show toast notification
      if (shouldShowToast) {
        if (isValidationError(apiError)) {
          showWarningToast(userMessage);
        } else {
          showErrorToast(userMessage);
        }
      }

      // Show alert modal
      if (shouldShowAlert) {
        Alert.alert("Erreur", userMessage, [
          ...(onRetry ? [{ text: "Réessayer", onPress: onRetry }] : []),
          { text: "Fermer", style: "cancel" },
        ]);
      }

      return apiError;
    },
    [],
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isLoading: false,
      message: null,
    });
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((isLoading: boolean) => {
    setErrorState((prev) => ({
      ...prev,
      isLoading,
    }));
  }, []);

  return {
    ...errorState,
    handleError,
    clearError,
    setLoading,
  };
};
