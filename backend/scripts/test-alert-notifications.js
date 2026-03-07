#!/usr/bin/env node

/**
 * Script de test pour vérifier que les notifications d'alerte sont bien envoyées
 * Usage: node scripts/test-alert-notifications.js
 */

const db = require('../models');
const logger = require('../config/logger');

async function testAlertNotifications() {
  try {
    logger.info('Starting alert notifications test...');

    // 1. Vérifier les utilisateurs donneurs
    const donors = await db.Utilisateur.findAll({
      where: { role: 'donneur' },
      include: [{
        model: db.ProfilDonneur,
        as: 'profilDonneur'
      }],
      limit: 5
    });

    logger.info(`Found ${donors.length} donors`, { count: donors.length });
    
    if (donors.length === 0) {
      logger.warn('No donors found. Run seed script first: npm run seed');
      process.exit(1);
    }

    // 2. Vérifier les alertes récentes
    const recentAlerts = await db.Alerte.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    logger.info(`Found ${recentAlerts.length} recent alerts`);

    if (recentAlerts.length === 0) {
      logger.warn('No alerts found. Create an alert first in the app');
      process.exit(1);
    }

    // 3. Vérifier les notifications pour la dernière alerte
    const lastAlert = recentAlerts[0];
    const notifications = await db.LogNotification.findAll({
      where: { id_alerte: lastAlert.id_alerte },
      include: [{
        model: db.Utilisateur,
        as: 'destinataire',
        attributes: ['id_utilisateur', 'nom', 'prenom', 'token_firebase']
      }]
    });

    logger.info('Alert Details', {
      alertId: lastAlert.id_alerte,
      bloodType: lastAlert.groupe_requis,
      urgency: lastAlert.degre_urgence,
      status: lastAlert.statut,
      createdAt: lastAlert.createdAt
    });

    logger.info(`Found ${notifications.length} notifications for alert ${lastAlert.id_alerte}`);

    // 4. Détails des notifications
    notifications.forEach((notif, idx) => {
      const donor = notif.destinataire;
      logger.info(`Notification ${idx + 1}`, {
        notificationId: notif.id_notification,
        donor: `${donor.prenom} ${donor.nom}`,
        donorId: donor.id_utilisateur,
        status: notif.statut_reception,
        channel: notif.canal,
        hasToken: !!donor.token_firebase,
        createdAt: notif.createdAt
      });
    });

    // 5. Statistiques
    const statuses = notifications.reduce((acc, n) => {
      acc[n.statut_reception] = (acc[n.statut_reception] || 0) + 1;
      return acc;
    }, {});

    logger.info('Notification Statistics', {
      total: notifications.length,
      statuses,
      ...statuses
    });

    // 6. Vérifier les tokens manquants
    const withoutToken = donors.filter(d => !d.token_firebase);
    if (withoutToken.length > 0) {
      logger.warn(`${withoutToken.length} donors have no Firebase token`, {
        donors: withoutToken.map(d => `${d.prenom} ${d.nom}`)
      });
    }

    logger.info('✅ Test completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Test failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

testAlertNotifications();
