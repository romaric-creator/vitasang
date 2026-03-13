import AsyncStorage from "@react-native-async-storage/async-storage";

const ALERT_FATIGUE_KEY = "alert_fatigue_stats";
const ALERT_INTERACTIONS_KEY = "alert_interactions";

const MAX_ALERTS_PER_DAY = 10;
const FATIGUE_THRESHOLD = 0.3; // If acceptance rate < 30%, user is fatigued

interface AlertFatigueStats {
  totalAlertsToday: number;
  acceptedAlertsToday: number;
  dismissedAlertsToday: number;
  acceptanceRate: number; // percentage
  lastReset: number; // timestamp
  isFatigued: boolean;
}

interface AlertInteraction {
  id: string;
  timestamp: number;
  type: "shown" | "accepted" | "dismissed";
  bloodType?: string;
  location?: string;
}

class AlertFatigueManager {
  /**
   * Record an alert interaction (shown, accepted, or dismissed)
   */
  async recordInteraction(
    alertId: string,
    type: "shown" | "accepted" | "dismissed",
    bloodType?: string,
    location?: string,
  ): Promise<void> {
    try {
      const interactions = await this.getInteractions();
      const newInteraction: AlertInteraction = {
        id: alertId,
        timestamp: Date.now(),
        type,
        bloodType,
        location,
      };

      interactions.push(newInteraction);
      await AsyncStorage.setItem(
        ALERT_INTERACTIONS_KEY,
        JSON.stringify(interactions),
      );

      // Update stats
      await this.updateStats();
    } catch (error) {
      console.error("Error recording alert interaction:", error);
    }
  }

  /**
   * Get all interactions
   */
  private async getInteractions(): Promise<AlertInteraction[]> {
    try {
      const data = await AsyncStorage.getItem(ALERT_INTERACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting interactions:", error);
      return [];
    }
  }

  /**
   * Get today's interactions (since midnight)
   */
  private getTodayInteractions(
    interactions: AlertInteraction[],
  ): AlertInteraction[] {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const midnightTime = midnight.getTime();

    return interactions.filter((i) => i.timestamp >= midnightTime);
  }

  /**
   * Update fatigue stats based on today's interactions
   */
  private async updateStats(): Promise<void> {
    try {
      const interactions = await this.getInteractions();
      const todayInteractions = this.getTodayInteractions(interactions);

      const shownCount = todayInteractions.filter(
        (i) => i.type === "shown",
      ).length;
      const acceptedCount = todayInteractions.filter(
        (i) => i.type === "accepted",
      ).length;
      const dismissedCount = todayInteractions.filter(
        (i) => i.type === "dismissed",
      ).length;

      const acceptanceRate =
        shownCount > 0 ? (acceptedCount / shownCount) * 100 : 0;

      const stats: AlertFatigueStats = {
        totalAlertsToday: shownCount,
        acceptedAlertsToday: acceptedCount,
        dismissedAlertsToday: dismissedCount,
        acceptanceRate: Math.round(acceptanceRate),
        lastReset: new Date().setHours(0, 0, 0, 0),
        isFatigued: acceptanceRate < FATIGUE_THRESHOLD && shownCount >= 3,
      };

      await AsyncStorage.setItem(ALERT_FATIGUE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  }

  /**
   * Get current fatigue stats
   */
  async getFatigueStats(): Promise<AlertFatigueStats> {
    try {
      const data = await AsyncStorage.getItem(ALERT_FATIGUE_KEY);
      if (!data) {
        return this.getEmptyStats();
      }

      const stats = JSON.parse(data) as AlertFatigueStats;

      // Check if we need to reset (new day)
      const today = new Date();
      const statsDate = new Date(stats.lastReset);

      if (
        today.getDate() !== statsDate.getDate() ||
        today.getMonth() !== statsDate.getMonth() ||
        today.getFullYear() !== statsDate.getFullYear()
      ) {
        return this.getEmptyStats();
      }

      return stats;
    } catch (error) {
      console.error("Error getting fatigue stats:", error);
      return this.getEmptyStats();
    }
  }

  /**
   * Get empty stats for a new day
   */
  private getEmptyStats(): AlertFatigueStats {
    return {
      totalAlertsToday: 0,
      acceptedAlertsToday: 0,
      dismissedAlertsToday: 0,
      acceptanceRate: 0,
      lastReset: new Date().setHours(0, 0, 0, 0),
      isFatigued: false,
    };
  }

  /**
   * Get recent interactions by blood type to detect patterns
   */
  async getInteractionsByBloodType(
    bloodType: string,
    days: number = 7,
  ): Promise<AlertInteraction[]> {
    try {
      const interactions = await this.getInteractions();
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

      return interactions.filter(
        (i) =>
          i.bloodType === bloodType &&
          i.timestamp >= cutoffTime &&
          i.type !== "shown",
      );
    } catch (error) {
      console.error("Error getting interactions by blood type:", error);
      return [];
    }
  }

  /**
   * Get fatigue recommendations
   */
  async getFatigueRecommendations(): Promise<string[]> {
    const stats = await this.getFatigueStats();
    const recommendations: string[] = [];

    if (stats.isFatigued) {
      recommendations.push(
        "Vous avez reçu plusieurs alertes avec peu de réponses. Prenez une pause.",
      );
    }

    if (stats.totalAlertsToday > MAX_ALERTS_PER_DAY) {
      recommendations.push(
        "Vous avez reçu beaucoup d'alertes aujourd'hui. Vous pouvez ajuster vos préférences.",
      );
    }

    if (stats.acceptanceRate < 20) {
      recommendations.push(
        "Votre taux d'acceptation est faible. Vérifiez vos critères d'alerte.",
      );
    }

    return recommendations;
  }

  /**
   * Check if user should receive another alert
   */
  async shouldShowAlert(): Promise<boolean> {
    const stats = await this.getFatigueStats();

    // If user is fatigued and already received multiple alerts, show warning instead
    if (stats.isFatigued && stats.totalAlertsToday > 5) {
      return false;
    }

    // Allow alerts but limit to max per day
    if (stats.totalAlertsToday >= MAX_ALERTS_PER_DAY) {
      return false;
    }

    return true;
  }

  /**
   * Reset all stats (for testing or manual reset)
   */
  async resetStats(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ALERT_FATIGUE_KEY);
      await AsyncStorage.removeItem(ALERT_INTERACTIONS_KEY);
    } catch (error) {
      console.error("Error resetting stats:", error);
    }
  }

  /**
   * Get summary for UI display
   */
  async getSummary(): Promise<string> {
    const stats = await this.getFatigueStats();

    if (stats.totalAlertsToday === 0) {
      return "Aucune alerte reçue aujourd'hui";
    }

    return `${stats.totalAlertsToday} alerte(s) - ${stats.acceptanceRate}% d'acceptation`;
  }
}

export const alertFatigueManager = new AlertFatigueManager();

/**
 * Hook to manage alert fatigue monitoring
 */
export const useAlertFatigue = () => {
  return {
    recordInteraction:
      alertFatigueManager.recordInteraction.bind(alertFatigueManager),
    getFatigueStats:
      alertFatigueManager.getFatigueStats.bind(alertFatigueManager),
    getFatigueRecommendations:
      alertFatigueManager.getFatigueRecommendations.bind(alertFatigueManager),
    shouldShowAlert:
      alertFatigueManager.shouldShowAlert.bind(alertFatigueManager),
    getSummary: alertFatigueManager.getSummary.bind(alertFatigueManager),
    resetStats: alertFatigueManager.resetStats.bind(alertFatigueManager),
  };
};
