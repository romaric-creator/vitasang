import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { DeviceEventEmitter } from "react-native";
import { getData, removeData } from "@/utils/storage";
import Constants from "expo-constants";
import { router } from "expo-router";
import { analyticsService } from "@/services/analyticsService";
import {
  parseApiError,
  getUserFriendlyMessage,
  isAuthError,
  isRetryableError,
  type ApiError,
} from "@/services/errorService";

const API_BASE_URL = (Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL || "https://vitasang.onrender.com/api").replace(/\/$/, "") + "/";
const REQUEST_TIMEOUT = 30000; // 30s - enough for most networks, cold start handled by pre-ping
const MAX_RETRIES = 2;
const PING_INTERVAL = 120000; // 2 minutes - wake up server before it sleeps
const PING_TIMEOUT = 5000; // 5s timeout for ping requests

let memoryToken: string | null = null;
let lastPingTime = 0;
let isPinging = false;
export const setAuthToken = (token: string | null) => {
  memoryToken = token;
};
/**
 * Transform and enrich error response
 */
const transformErrorResponse = (error: AxiosError): ApiError => {
  const response = error.response?.data as any;

  // If response already has our error format, use it
  if (response?.error) {
    return response.error;
  }

  // Handle network/timeout errors
  if (error.code === "ECONNABORTED") {
    return {
      code: "TIMEOUT",
      message: "La requête a expiré",
      statusCode: 408,
    };
  }

  if (!error.response) {
    return {
      code: "NETWORK_ERROR",
      message: "Erreur de connexion",
      statusCode: 0,
    };
  }

  // Parse standard API error
  const status = error.response.status;
  return {
    code: response?.code || `HTTP_${status}`,
    message: response?.message || response?.error || "Une erreur est survenue",
    statusCode: status,
    details: response?.details,
  };
};

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  /**
   * Request Interceptor - Add auth token, wake up server, and logging
   */
  instance.interceptors.request.use(
    async (config) => {
      let token = memoryToken;
      if (!token) {
        token = await getData("token");
        if (token) setAuthToken(token);
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Pre-ping to wake up sleeping server (e.g., Render.com free tier)
      const now = Date.now();
      const needsPing = now - lastPingTime > PING_INTERVAL && 
                        config.url !== "ping" && 
                        config.url !== "health" &&
                        !isPinging;

      if (needsPing) {
        isPinging = true;
        instance.get("ping", { timeout: PING_TIMEOUT })
          .then(() => {
            lastPingTime = Date.now();
          })
          .catch(() => {
            // Ping failed, will retry on next request
          })
          .finally(() => {
            isPinging = false;
          });
      }

      // Log request in development
      if (__DEV__) {
        console.log("[API Request]", {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          hasToken: !!token,
        });
      }

      return config;
    },
    (error) => {
      console.error("[Request Interceptor Error]", error.message);
      return Promise.reject(error);
    },
  );

  /**
   * Response Interceptor - Handle all responses and errors
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Reset retry count on success (per-request tracking)
      if (response.config) {
        (response.config as any)._retryCount = 0;
      }

      if (__DEV__) {
        console.log("[API Response]", {
          status: response.status,
          url: response.config.url,
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const apiError = transformErrorResponse(error);
      const userMessage = getUserFriendlyMessage(apiError);

      // Tracking des erreurs API dans PostHog
      analyticsService.trackEvent(analyticsService.events.API_ERROR, {
        code: apiError.code,
        statusCode: apiError.statusCode,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });


      if (__DEV__) {
        console.error("[API Error]", {
          code: apiError.code,
          statusCode: apiError.statusCode,
          message: apiError.message,
          url: error.config?.url,
        });
      }

      // Handle authentication errors
      if (isAuthError(apiError)) {
        await removeData("token");
        await removeData("user");
        DeviceEventEmitter.emit("FORCE_LOGOUT");
        setTimeout(() => router.replace("/Splash"), 300);

        return Promise.reject({
          ...apiError,
          userMessage,
        });
      }

      // Implement retry logic for specific errors (per-request tracking)
      const config = error.config as any;
      const currentRetryCount = config?._retryCount || 0;

      if (
        isRetryableError(apiError) &&
        currentRetryCount < MAX_RETRIES &&
        config
      ) {
        config._retryCount = currentRetryCount + 1;
        const backoffMs = Math.pow(2, config._retryCount) * 1000; // Exponential backoff

        if (__DEV__) {
          console.log(
            `[Retry] Attempt ${config._retryCount}/${MAX_RETRIES} in ${backoffMs}ms`,
          );
        }

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(instance(config));
          }, backoffMs);
        });
      }

      const structuredError = {
        ...apiError,
        userMessage,
        response: error.response, // Garder la structure compatible avec les services existants
        isAxiosError: true,
      };
      return Promise.reject(structuredError);
    },
  );

  return instance;
};

export const apiClient = createAxiosInstance();
