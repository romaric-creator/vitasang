const logger = require("../config/logger");

let twilioClient = null;

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;

  try {
    const twilio = require("twilio");
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
  } catch {
    logger.warn("[WhatsApp] twilio package not installed. Run: npm install twilio");
    return null;
  }
};

/**
 * Sanitise un numéro de téléphone en format international (chiffres uniquement).
 * Ajoute le préfixe pays par défaut si le numéro commence par 0.
 */
const sanitizePhone = (phone, defaultCountryCode = "225") => {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0") && digits.length <= 10) {
    return defaultCountryCode + digits.slice(1);
  }
  return digits;
};

/**
 * Envoie un message WhatsApp via Twilio.
 * @param {string} phone - Numéro du destinataire (avec ou sans préfixe pays)
 * @param {string} message - Corps du message
 * @returns {Promise<{success: boolean, service: string, sid?: string, error?: string}>}
 */
const sendWhatsApp = async (phone, message) => {
  const client = getTwilioClient();

  if (!client) {
    logger.warn(`[WhatsApp] Service non configuré — message non envoyé à ${phone}`);
    return { success: false, service: "twilio", error: "not_configured" };
  }

  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const sanitized = sanitizePhone(phone);
  const to = `whatsapp:+${sanitized}`;

  try {
    const result = await client.messages.create({ from, to, body: message });
    logger.info(`[WhatsApp] Message envoyé à ${to}`, { sid: result.sid });
    return { success: true, service: "twilio", sid: result.sid };
  } catch (err) {
    logger.error(`[WhatsApp] Échec envoi à ${to}`, { error: err.message, code: err.code });
    return { success: false, service: "twilio", error: err.message };
  }
};

/**
 * Envoie des messages WhatsApp en batch avec limite de concurrence.
 * @param {Array<{phone: string, message: string}>} targets
 * @param {number} concurrency
 * @returns {Promise<{sent: number, failed: number, results: Array}>}
 */
const sendWhatsAppBatch = async (targets, concurrency = 5) => {
  const results = [];
  for (let i = 0; i < targets.length; i += concurrency) {
    const batch = targets.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(({ phone, message }) => sendWhatsApp(phone, message))
    );
    results.push(...batchResults);
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.length - sent;
  logger.info(`[WhatsApp Batch] ${sent} envoyés, ${failed} échecs sur ${results.length} total`);

  return { sent, failed, results };
};

module.exports = { sendWhatsApp, sendWhatsAppBatch, sanitizePhone };
