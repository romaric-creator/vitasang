// Expo SDK mock for testing
module.exports = {
  Expo: jest.fn(function() {
    return {
      isExpoPushToken: jest.fn(token => !!token),
      sendPushNotificationsAsync: jest.fn(async () => ({ data: [] }))
    };
  })
};
