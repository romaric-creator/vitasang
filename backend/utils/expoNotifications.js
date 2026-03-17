/**
 * Expo Push Notifications utility
 * Manages push notifications with proper error handling
 */

const { Expo } = require("expo-server-sdk");
const logger = require("../config/logger");

const expo = new Expo();

/**
 * Sends push notifications with individual error handling
 * @param {Array} messages - Array of push notification objects
 * @returns {Object} { successful: Array, failed: Array, tickets: Array }
 */
exports.sendPushNotifications = async (messages) => {
  if (!messages || messages.length === 0) {
    return { successful: [], failed: [], tickets: [] };
  }

  // Filter valid Expo tokens
  const validMessages = messages.filter((msg) => {
    if (!Expo.isExpoPushToken(msg.to)) {
      logger.warn("Invalid Expo push token", { token: msg.to });
      return false;
    }
    return true;
  });

  if (validMessages.length === 0) {
    logger.warn("No valid Expo tokens found in batch");
    return { successful: [], failed: [], tickets: [] };
  }

  const chunks = expo.chunkPushNotifications(validMessages);
  const tickets = [];
  const failed = [];
  const successful = [];

  // Send notifications in chunks
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

      ticketChunk.forEach((ticket, index) => {
        if (ticket.id) {
          tickets.push(ticket);
          successful.push(chunk[index].to);
        } else {
          logger.error("Push notification ticket error", {
            token: chunk[index].to,
            error: ticket.message || "Unknown error",
          });
          failed.push({
            token: chunk[index].to,
            error: ticket.message || "Unknown error",
          });
        }
      });
    } catch (error) {
      logger.error("Error sending push notification chunk", {
        error: error.message,
        chunkSize: chunk.length,
      });

      // Mark all in this chunk as failed
      chunk.forEach((msg) => {
        failed.push({
          token: msg.to,
          error: error.message,
        });
      });
    }
  }

  return {
    successful,
    failed,
    tickets,
  };
};

/**
 * Verifies valid Expo push token format
 * @param {string} token - Expo push token
 * @returns {boolean}
 */
exports.isValidExpoPushToken = (token) => {
  return Expo.isExpoPushToken(token);
};

/**
 * Build a push notification message object
 * @param {Object} options
 * @returns {Object} Message object for Expo API
 */
exports.buildPushMessage = ({
  to,
  title,
  body,
  data = {},
  badge,
  sound = "default",
}) => {
  return {
    to,
    sound,
    title,
    body,
    data,
    badge,
  };
};
