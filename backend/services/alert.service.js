const db = require("../models");
const Alerte = db.Alerte;
const logger = require("../config/logger");
const { haversineSQL } = require("../utils/geoHelpers");
const { notificationQueue } = require("../jobs/notification.queue");
const { ErrorTypes } = require("../utils/errorHandler");

/**
 * Service gérant la logique métier des alertes de don de sang.
 */
class AlertService {
  /**
   * @description Tente de valider automatiquement une alerte si elle est proche d'un centre.
   * @param {object} alerte - L'instance de l'alerte Sequelize
   * @returns {Promise<boolean>} - True si l'alerte a été auto-validée
   */
  async attemptAutoValidation(alerte) {
    const { latitude, longitude, id_alerte, groupe_requis, rayon_action_km, degre_urgence } = alerte;

    try {
      const haversine = haversineSQL(latitude, longitude);
      const [centresProches] = await db.sequelize.query(`
        SELECT id_centre, nom_centre, ${haversine} AS distance
        FROM Centres_Sante
        WHERE ${haversine} <= 2
        ORDER BY distance ASC
        LIMIT 1
      `);

      if (centresProches.length > 0) {
        logger.info("[AlertService.autoValidation] Alert validated via center proximity", {
          alertId: id_alerte,
          centerId: centresProches[0].id_centre,
          distance: centresProches[0].distance,
        });

        alerte.statut = "en_cours";
        alerte.id_centre = centresProches[0].id_centre;
        await alerte.save();

        // Ajout immédiat à la file de notifications
        await this.enqueueNotification(alerte);

        return true;
      }
      return false;
    } catch (error) {
      logger.error("[AlertService.autoValidation] Error during auto-validation", {
        alertId: alerte.id_alerte,
        error: error.message
      });
      return false;
    }
  }

  /**
   * @description Ajoute une alerte à la file d'attente des notifications.
   * @param {object} alerte - Instance Sequelize de l'alerte
   * @param {number|null} validatorId - ID de l'utilisateur ayant validé
   */
  async enqueueNotification(alerte, validatorId = null) {
    try {
      await notificationQueue.add("sendAlert", {
        alertId: alerte.id_alerte,
        groupe_requis: alerte.groupe_requis,
        latitude: alerte.latitude,
        longitude: alerte.longitude,
        rayon_action_km: alerte.rayon_action_km,
        degre_urgence: alerte.degre_urgence,
        validatorId,
      });
      logger.info("[AlertService.enqueue] Notification enqueued", { alertId: alerte.id_alerte });
    } catch (error) {
      logger.error("[AlertService.enqueue] Failed to enqueue notification", { 
        alertId: alerte.id_alerte, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * @description Crée une nouvelle alerte et tente de l'auto-valider.
   * @param {object} alertData - Données de l'alerte
   * @param {number|null} initiatorId - ID de l'utilisateur ou null pour guest
   * @returns {Promise<object>} - L'alerte créée et le résultat de l'auto-validation
   */
  async createAlert(alertData, initiatorId) {
    try {
      const {
        latitude,
        longitude,
        groupe_sanguin,
        radius,
        urgence,
        quantite_requise,
        lieu,
        description,
        telephone_contact,
        nom_patient,
      } = alertData;

      const alerte = await Alerte.create({
        groupe_requis: groupe_sanguin,
        degre_urgence: urgence || (initiatorId ? "NORMAL" : "URGENT"),
        rayon_action_km: radius || (initiatorId ? 10 : 15),
        id_initiateur: initiatorId,
        latitude,
        longitude,
        lieu,
        description: description || (nom_patient ? `Urgence pour ${nom_patient}` : ""),
        telephone_contact,
        nom_patient,
        quantite_requise: quantite_requise || 1,
        statut: "en_attente_validation",
      });

      const isAutoValidated = await this.attemptAutoValidation(alerte);

      return { alerte, isAutoValidated };
    } catch (error) {
      logger.error("[AlertService.create] Failed to create alert", { error: error.message });
      throw error;
    }
  }

  /**
   * @description Valide manuellement une alerte en attente.
   * @param {number} alertId - ID de l'alerte à valider
   * @param {number} validatorId - ID du personnel validant
   */
  async validateAlert(alertId, validatorId) {
    const alerte = await Alerte.findByPk(alertId);
    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");

    if (alerte.statut !== "en_attente_validation") {
      throw ErrorTypes.BAD_REQUEST(`L'alerte est déjà traitée (${alerte.statut}).`);
    }

    alerte.statut = "en_cours";
    await alerte.save();

    await this.enqueueNotification(alerte, validatorId);

    return alerte;
  }
}

module.exports = new AlertService();
