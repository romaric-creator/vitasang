import { useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = (options?: UseApiOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const request = useCallback(
    async (
      method: "get" | "post" | "put" | "delete",
      url: string,
      data?: any,
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api[method](url, data);

        if (response.data.success === false) {
          const errorMsg = response.data.message || "Une erreur est survenue";
          setError(errorMsg);
          options?.onError?.(errorMsg);
          return null;
        }

        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        let errorMsg = "Erreur de connexion";

        if (err.response?.status === 401) {
          errorMsg = "Session expirée. Reconnexion...";
          logout();
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        options?.onError?.(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [logout, options],
  );

  return { request, loading, error, setError };
};
