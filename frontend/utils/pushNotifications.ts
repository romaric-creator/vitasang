import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Fonction utilitaire pour importer expo-notifications sans faire crasher Expo Go SDK 53+
const getNotificationsModule = () => {
  try {
    return require("expo-notifications");
  } catch (e) {
    console.warn("[PushNotifications] Impossible de charger expo-notifications", e);
    return null;
  }
};

export async function registerForPushNotificationsAsync() {
  const Notifications = getNotificationsModule();
  if (!Notifications) return null;

  let token;

  // On évite les appels qui crashent sur Expo Go SDK 53 (Android Remote Notifications)
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo && Platform.OS === 'android') {
    console.warn("[PushNotifications] Les notifications push distantes ne sont plus supportées dans Expo Go sur Android (SDK 53+). Utilisez un build de développement.");
    return null;
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.warn("Permission de notification non accordée");
        return;
      }

      // Fallbacks pour le projectId selon les versions d'Expo Go / SDK
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId ||
        (Constants.expoConfig as any)?.updates?.url?.split("/").pop();

      if (!projectId) {
        console.warn(
          "Aucun Project ID EAS trouvé. Les notifications push ne fonctionneront pas sans configuration EAS.",
        );
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Push Token obtenu:", token);
    } else {
      console.log("Les notifications push nécessitent un appareil physique.");
    }
  } catch (e: any) {
    console.error("Erreur lors de l’obtention du Push Token:", e.message);
  }

  return token;
}
