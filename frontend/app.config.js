const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      env: {
        EXPO_PUBLIC_API_BASE_URL:
          process.env.EXPO_PUBLIC_API_BASE_URL ||
          "https://vitasang.onrender.com/api",
        EXPO_PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY || "",
      },
    },
  };
};
