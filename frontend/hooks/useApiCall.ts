import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface ApiCallOptions {
  maxRetries?: number;
  timeout?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

/**
 * Hook pour gérer les appels API avec retry et timeout
 * @param apiFunction Fonction API à exécuter
 * @param options Options de configuration
 */
export const useApiCall = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  options: ApiCallOptions = {}
) => {
  const {
    maxRetries = 3,
    timeout = 10000, // 10 seconds par défaut
    onError,
    onSuccess,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeCall = useCallback(
    async (...args: Parameters<T>) => {
      setLoading(true);
      setError(null);

      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Créer une promise avec timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Timeout de connexion - Vérifiez votre connexion Internet')),
              timeout
            )
          );

          const result = await Promise.race([
            apiFunction(...args),
            timeoutPromise,
          ]);

          setLoading(false);
          if (onSuccess) {
            onSuccess(result);
          }
          return result;
        } catch (err: any) {
          lastError = new Error(
            err.message || `Erreur API (tentative ${attempt}/${maxRetries})`
          );

          logger.warn('API call failed', {
            attempt,
            maxRetries,
            error: lastError.message,
          });

          if (attempt === maxRetries) {
            setError(lastError);
            if (onError) {
              onError(lastError);
            }
            setLoading(false);
            throw lastError;
          }

          // Attendre avant de réessayer (exponential backoff)
          await new Promise(resolve =>
            setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
          );
        }
      }

      throw lastError || new Error('Erreur API inconnue');
    },
    [apiFunction, maxRetries, timeout, onError, onSuccess]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute: executeCall,
    loading,
    error,
    reset,
  };
};
