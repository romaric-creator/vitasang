/**
 * API Request Wrapper with Error Handling
 * Provides automatic error handling and loading state for API calls
 */

import { useState, useCallback } from "react";
import { useErrorHandler as useErrorHandlerHook } from "./useErrorHandler";

interface ApiRequestOptions {
  showError?: boolean;
  showAlert?: boolean;
  context?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for making API requests with automatic error handling
 * @example
 * const { execute, isLoading, data } = useApiRequest();
 *
 * const handleSubmit = async () => {
 *   const result = await execute(
 *     () => apiClient.post('/alerts/1/respond', { response: 'accepte' }),
 *     { context: 'Acceptance of alert' }
 *   );
 * };
 */
export const useApiRequest = () => {
  const { handleError, setLoading, clearError } = useErrorHandlerHook();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T = any>(
      request: () => Promise<any>,
      options: ApiRequestOptions = {},
    ): Promise<T | null> => {
      const {
        showError = true,
        showAlert = false,
        context = "",
        onSuccess,
        onError,
      } = options;

      try {
        clearError();
        setIsLoading(true);
        setLoading(true);

        const response = await request();
        const result = response?.data || response;

        setData(result);
        onSuccess?.();

        return result as T;
      } catch (error) {
        handleError(error, {
          showToast: showError,
          showAlert,
          context,
        });
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    },
    [handleError, setLoading, clearError],
  );

  return {
    execute,
    data,
    isLoading,
  };
};

/**
 * Hook for form submission with error handling
 * Handles both validation and API errors
 */
export const useFormSubmit = (
  onSubmit: (values: any) => Promise<any>,
  options: ApiRequestOptions = {},
) => {
  const { execute, isLoading } = useApiRequest();

  const handleSubmit = useCallback(
    async (values: any) => {
      return execute(() => onSubmit(values), options);
    },
    [execute, options],
  );

  return { handleSubmit, isLoading };
};
