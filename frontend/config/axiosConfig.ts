import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { getData } from '@/utils/storage';
import Constants from 'expo-constants'; // Import Constants

const API_BASE_URL = Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL;
const REQUEST_TIMEOUT = 10000; // 10 seconds

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token
  instance.interceptors.request.use(
    async (config) => {
      const token = await getData('token');
      console.log('Axios request - Token available:', !!token);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set');
      } else if (!token) {
        console.warn('No token found in storage');
      }

      const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
      console.log('Request to:', fullUrl);
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('Response success:', response.status);
      return response;
    },
    (error: AxiosError) => {
      console.error('Response error:', error.code);
      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
        return Promise.reject({
          message: 'La requête a expiré. Veuillez réessayer.',
          code: 'TIMEOUT',
          originalError: error,
        });
      }

      // Handle network error
      if (!error.response) {
        console.error('Network error - no response');
        return Promise.reject({
          message: 'Erreur de connexion. Veuillez vérifier votre internet.',
          code: 'NETWORK_ERROR',
          originalError: error,
        });
      }

      // Handle 4xx/5xx errors
      const status = error.response.status;
      const responseData = error.response.data as any;
      console.error('HTTP error:', status);
      let message = 'Une erreur est survenue.';

      switch (status) {
        case 400:
          message = responseData?.error || responseData?.message || 'Données invalides.';
          break;
        case 401:
          message = 'Authentification requise. Veuillez vous reconnecter.';
          break;
        case 403:
          message = 'Accès refusé.';
          break;
        case 404:
          message = 'Ressource introuvable.';
          break;
        case 429:
          message = 'Trop de requêtes. Veuillez attendre.';
          break;
        case 500:
          message = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          message = responseData?.error || responseData?.message || 'Une erreur est survenue.';
      }

      return Promise.reject({
        message,
        status,
        data: responseData,
        originalError: error,
      });
    }
  );

  return instance;
};

export const apiClient = createAxiosInstance();
