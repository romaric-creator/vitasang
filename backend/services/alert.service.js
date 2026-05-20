const db = require("../models");
const { Alerte, Utilisateur, LogNotification } = db;
const logger = require("../config/logger");
const cacheService = require('./cache.service');
const { haversineSQL, calculateDistance } = require("../utils/geoHelpers");
const { notificationQueue } = require("../jobs/notification.queue");
const { ErrorTypes } = require("../utils/errorHandler");

/**
 * Service gérant la logique métier des alertes de don de sang.
 */
class AlertService {
  /**
   * Tente de valider automatiquement une alerte si elle est proche d'un centre.
   */
  async attemptAutoValidation(alerte) {
    const { latitude, longitude, id_alerte } = alerte;

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
   * Ajoute une alerte à la file d'attente des notifications.
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
        initiatorId: alerte.id_initiateur,
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
   * Crée une nouvelle alerte et tente de l'auto-valider.
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

      await cacheService.del('api-cache:/api/alerts/public');

      return { alerte, isAutoValidated };
    } catch (error) {
      logger.error("[AlertService.create] Failed to create alert", { error: error.message });
      throw error;
    }
  }

  /**
   * Valide manuellement une alerte en attente.
   */
  async validateAlert(alertId, validatorId) {
    const alerte = await Alerte.findByPk(alertId);
    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");

    if (alerte.statut !== "en_attente_validation") {
      throw ErrorTypes.BAD_REQUEST(`L'alerte est déjà traitée (${alerte.statut}).`);
    }

    alerte.statut = "en_cours";
    await alerte.save();

    await cacheService.del('api-cache:/api/alerts/public');

    await this.enqueueNotification(alerte, validatorId);

    return alerte;
  }

  /**
   * Récupère le statut complet d'une alerte avec stats et détails donneurs
   */
  async getAlertStatus(alertId) {
    const alerte = await Alerte.findByPk(alertId, {
      include: [
        {
          model: LogNotification,
          as: "notifications",
          include: [
            {
              model: Utilisateur,
              as: "destinataire",
              attributes: ["nom", "prenom", "telephone"],
              include: [{ model: db.ProfilDonneur, as: "profilDonneur", attributes: ["lat_actuelle", "long_actuelle"] }]
            }
          ],
        },
        { model: Utilisateur, as: "initiateur", attributes: ["id_utilisateur", "nom", "prenom", "telephone"] },
      ],
    });

    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");

    const stats = {
      total: alerte.notifications.length,
      accepte: alerte.notifications.filter(n => n.statut_reception === "accepte" || n.statut_reception === "don_effectue").length,
      lu: alerte.notifications.filter(n => n.statut_reception === "lu").length,
    };

    const details = alerte.notifications.map(n => {
      let distance = null;
      if (n.destinataire?.profilDonneur?.lat_actuelle && n.destinataire?.profilDonneur?.long_actuelle && alerte.latitude && alerte.longitude) {
        distance = calculateDistance(
          parseFloat(alerte.latitude),
          parseFloat(alerte.longitude),
          parseFloat(n.destinataire.profilDonneur.lat_actuelle),
          parseFloat(n.destinataire.profilDonneur.long_actuelle)
        );
      }
      return {
        donneur: n.destinataire ? `${n.destinataire.prenom} ${n.destinataire.nom}` : (n.nom_guest || "Invité"),
        statut: n.statut_reception,
        telephone: n.destinataire ? n.destinataire.telephone : (n.telephone_guest || null),
        isGuest: !n.destinataire,
        distance: distance !== null ? distance.toFixed(1) : null
      };
    });

    details.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

    return {
      alerte: {
        id: alerte.id_alerte,
        groupe: alerte.groupe_requis,
        statut: alerte.statut,
        createdAt: alerte.createdAt,
        lieu: alerte.lieu,
        latitude: alerte.latitude,
        longitude: alerte.longitude,
        urgence: alerte.degre_urgence,
        quantite_requise: alerte.quantite_requise,
        description: alerte.description,
        nom_patient: alerte.nom_patient,
        telephone_contact: alerte.telephone_contact,
        initiateur: alerte.initiateur ? {
          id: alerte.initiateur.id_utilisateur,
          nom: alerte.initiateur.nom,
          prenom: alerte.initiateur.prenom,
          telephone: alerte.initiateur.telephone,
        } : null,
      },
      stats,
      details,
    };
  }

  /**
   * Répond à une alerte (donneur)
   */
  async respondToAlert(alertId, userId, response) {
    const transaction = await db.sequelize.transaction();
    try {
      let notification = await LogNotification.findOne({
        where: { id_alerte: alertId, id_utilisateur: userId },
        transaction,
      });

      if (!notification) {
        notification = await LogNotification.create({ id_alerte: alertId, id_utilisateur: userId, statut_reception: response }, { transaction });
      } else {
        notification.statut_reception = response;
        await notification.save({ transaction });
      }

      if (response === "accepte") {
        const alerte = await Alerte.findByPk(alertId, { transaction });
        if (alerte && alerte.statut === "en_cours") {
          const count = await LogNotification.count({ where: { id_alerte: alertId, statut_reception: "accepte" }, transaction });
          if (count >= alerte.quantite_requise) {
            alerte.statut = "resolu";
            await alerte.save({ transaction });
          }
        }

        // Notify initiator when donor accepts
        if (alerte && alerte.id_initiateur) {
          try {
            const donor = await Utilisateur.findByPk(userId, { transaction });
            const initiator = await Utilisateur.findByPk(alerte.id_initiateur, { transaction });

            if (initiator && initiator.push_token && donor) {
              const donorName = `${donor.prenom} ${donor.nom}`;
              await notificationQueue.add("sendInitiatorNotification", {
                initiatorId: alerte.id_initiateur,
                alertId: alertId,
                donorName: donorName,
                groupe: alerte.groupe_requis,
                message: `${donorName} a accepté de donner du sang ${alerte.groupe_requis}`,
              });
              logger.info("[AlertService.respondToAlert] Initiator notification enqueued", {
                alertId,
                initiatorId: alerte.id_initiateur,
                donorId: userId,
              });
            }
          } catch (error) {
            logger.error("[AlertService.respondToAlert] Failed to notify initiator", {
              alertId,
              initiatorId: alerte.id_initiateur,
              error: error.message,
            });
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async getAlertByPublicToken(token) {
    const alerte = await Alerte.findOne({
      where: { public_token: token },
      attributes: [
        'public_token', 'groupe_requis', 'degre_urgence',
        'lieu', 'statut', 'createdAt', 'quantite_requise',
        'telephone_contact',
      ],
      include: [
        { model: Utilisateur, as: 'initiateur', attributes: ['telephone'] },
      ],
    });
    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
    const telephone = alerte.telephone_contact || alerte.initiateur?.telephone || null;
    // Formater pour WhatsApp : retirer le + et les espaces
    const whatsapp = telephone ? telephone.replace(/[^0-9]/g, '') : null;
    return {
      alerte: {
        token: alerte.public_token,
        groupe: alerte.groupe_requis,
        urgence: alerte.degre_urgence,
        lieu: alerte.lieu,
        statut: alerte.statut,
        date: alerte.createdAt,
        quantite: alerte.quantite_requise,
        whatsapp,
      }
    };
  }
}

module.exports = new AlertService();
