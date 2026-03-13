import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { DeviceEventEmitter } from "react-native";
import { getData, removeData } from "@/utils/storage";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  parseApiError,
  getUserFriendlyMessage,
  isAuthError,
  isRetryableError,
  type ApiError,
} from "@/services/errorService";

const API_BASE_URL = Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL;
const REQUEST_TIMEOUT = 10000;
const MAX_RETRIES = 3;
let retryCount = 0;

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
   * Request Interceptor - Add auth token and logging
   */
  instance.interceptors.request.use(
    async (config) => {
      const token = await getData("token");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
      retryCount = 0; // Reset retry count on success

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

      // Implement retry logic for specific errors
      if (
        isRetryableError(apiError) &&
        retryCount < MAX_RETRIES &&
        error.config
      ) {
        retryCount++;
        const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff

        if (__DEV__) {
          console.log(
            `[Retry] Attempt ${retryCount}/${MAX_RETRIES} in ${backoffMs}ms`,
          );
        }

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(instance(error.config!));
          }, backoffMs);
        });
      }

      return Promise.reject({
        ...apiError,
        userMessage,
      });
    },
  );

  return instance;
};

export const apiClient = createAxiosInstance();
