/**
 * Alert Management Service
 * Gère le retry automatique, limite d'alertes, et notification utilisateur
 */

import { getData, storeData } from "@/utils/storage";

export interface AlertWithRetry {
  id: string;
  alertId: number;
  groupe: string;
  lieu: string;
  urgence: string;
  type?: string;
  location?: string;
  createdAt: string;
  lastRetryAt?: string;
  retryCount: number;
  dismissed: boolean;
}

const ALERT_RETRY_INTERVAL = 15 * 60 * 1000; // 15 minutes
const MAX_ALERTS_DISPLAYED = 5;
const MAX_RETRY_COUNT = 6; // 6 * 15min = 90 minutes max

/**
 * Gère le stockage et la récupération des alertes avec retry
 */
export class AlertRetryManager {
  private static readonly STORAGE_KEY = "alert_retry_queue";

  /**
   * Ajouter une alerte à la queue de retry
   */
  static async addAlertToRetryQueue(alert: any): Promise<void> {
    try {
      const queue = await this.getRetryQueue();
      const existingIndex = queue.findIndex(
        (a) => a.alertId === alert.id_alerte,
      );

      if (existingIndex >= 0) {
        // Réinitialiser le compteur si c'est une nouvelle alerte
        queue[existingIndex].retryCount = 0;
      } else {
        queue.push({
          id: `${Date.now()}-${Math.random()}`,
          alertId: alert.id_alerte,
          groupe: alert.groupe_requis,
          lieu: alert.lieu,
          urgence: alert.degre_urgence,
          createdAt: new Date().toISOString(),
          retryCount: 0,
          dismissed: false,
        });
      }

      await storeData(this.STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("Error adding alert to retry queue:", error);
    }
  }

  /**
   * Récupérer la queue de retry
   */
  static async getRetryQueue(): Promise<AlertWithRetry[]> {
    try {
      const data = await getData(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting retry queue:", error);
      return [];
    }
  }

  /**
   * Obtenir les alertes prêtes pour retry
   */
  static async getAlertsReadyForRetry(): Promise<AlertWithRetry[]> {
    try {
      const queue = await this.getRetryQueue();
      const now = Date.now();

      return queue.filter((alert) => {
        if (alert.dismissed || alert.retryCount >= MAX_RETRY_COUNT) {
          return false;
        }

        const lastRetry = alert.lastRetryAt
          ? new Date(alert.lastRetryAt).getTime()
          : new Date(alert.createdAt).getTime();

        return now - lastRetry >= ALERT_RETRY_INTERVAL;
      });
    } catch (error) {
      console.error("Error getting alerts ready for retry:", error);
      return [];
    }
  }

  /**
   * Marquer une alerte comme retentée
   */
  static async markAlertAsRetried(alertId: string): Promise<void> {
    try {
      const queue = await this.getRetryQueue();
      const alert = queue.find((a) => a.id === alertId);

      if (alert) {
        alert.lastRetryAt = new Date().toISOString();
        alert.retryCount += 1;
        await storeData(this.STORAGE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error("Error marking alert as retried:", error);
    }
  }

  /**
   * Marquer une alerte comme lue/ignorée
   */
  static async dismissAlert(alertId: string): Promise<void> {
    try {
      const queue = await this.getRetryQueue();
      const alert = queue.find((a) => a.id === alertId);

      if (alert) {
        alert.dismissed = true;
        await storeData(this.STORAGE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  }

  /**
   * Nettoyer les alertes expirées
   */
  static async cleanupExpiredAlerts(): Promise<void> {
    try {
      const queue = await this.getRetryQueue();
      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 heures

      const filtered = queue.filter((alert) => {
        const createdTime = new Date(alert.createdAt).getTime();
        return createdTime > cutoffTime && !alert.dismissed;
      });

      await storeData(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error cleaning up expired alerts:", error);
    }
  }

  /**
   * Obtenir les alertes non lues pour affichage
   */
  static async getUnreadAlerts(): Promise<AlertWithRetry[]> {
    try {
      const queue = await this.getRetryQueue();
      return queue.filter((a) => !a.dismissed).slice(0, MAX_ALERTS_DISPLAYED);
    } catch (error) {
      console.error("Error getting unread alerts:", error);
      return [];
    }
  }

  /**
   * Obtenir le nombre total d'alertes en attente
   */
  static async getAlertCountStats(): Promise<{
    total: number;
    dismissed: number;
    pending: number;
    overLimit: boolean;
  }> {
    try {
      const queue = await this.getRetryQueue();
      const pending = queue.filter((a) => !a.dismissed).length;

      return {
        total: queue.length,
        dismissed: queue.filter((a) => a.dismissed).length,
        pending,
        overLimit: pending > MAX_ALERTS_DISPLAYED,
      };
    } catch (error) {
      console.error("Error getting alert stats:", error);
      return { total: 0, dismissed: 0, pending: 0, overLimit: false };
    }
  }
}

/**
 * Hook pour gérer les alertes
 */
export const useAlertRetry = () => {
  const [alertStats, setAlertStats] = React.useState({
    total: 0,
    pending: 0,
    overLimit: false,
  });

  const refreshAlertStats = React.useCallback(async () => {
    const stats = await AlertRetryManager.getAlertCountStats();
    setAlertStats({
      total: stats.total,
      pending: stats.pending,
      overLimit: stats.overLimit,
    });
  }, []);

  const handleRetryAlerts = React.useCallback(async () => {
    const alertsToRetry = await AlertRetryManager.getAlertsReadyForRetry();

    for (const alert of alertsToRetry) {
      await AlertRetryManager.markAlertAsRetried(alert.id);
    }

    await refreshAlertStats();
    return alertsToRetry;
  }, [refreshAlertStats]);

  const dismissAlert = React.useCallback(
    async (alertId: string) => {
      await AlertRetryManager.dismissAlert(alertId);
      await refreshAlertStats();
    },
    [refreshAlertStats],
  );

  return {
    alertStats,
    refreshAlertStats,
    handleRetryAlerts,
    dismissAlert,
  };
};

import React from "react";
