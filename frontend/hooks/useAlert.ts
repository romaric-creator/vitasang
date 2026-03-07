import { useState, useCallback } from 'react';
import { AlertType } from '@/components/AlertToast';

interface AlertState {
  visible: boolean;
  type: AlertType;
  message: string;
  title?: string;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    type: 'info',
    message: '',
    title: '',
  });

  const showAlert = useCallback(
    (message: string, type: AlertType = 'info', title?: string) => {
      setAlertState({
        visible: true,
        type,
        message,
        title,
      });
    },
    []
  );

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, 'success', title || 'Succès');
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, 'error', title || 'Erreur');
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, 'warning', title || 'Attention');
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert(message, 'info', title || 'Information');
  }, [showAlert]);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return {
    ...alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
  };
};
