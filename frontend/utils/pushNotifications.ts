import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
  let token;

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

    try {
      // Debug config
      console.log(
        "Constants.expoConfig structure:",
        JSON.stringify(Constants.expoConfig, null, 2),
      );

      // Fallbacks pour le projectId selon les versions d'Expo Go / SDK
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId ||
        (Constants.expoConfig as any)?.updates?.url?.split("/").pop(); // tentative de récupération via l'URL d'update

      if (!projectId) {
        console.warn(
          "⚠️ Aucun Project ID EAS trouvé. Les notifications push ne fonctionneront pas sans configuration EAS.",
        );
        console.warn(
          '👉 Exécutez "npx eas project:init" pour lier ce projet à votre compte Expo.',
        );
        return;
      }

      console.log("Utilisation du projectId:", projectId);
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Push Token obtenu:", token);
    } catch (e: any) {
      console.error("Erreur lors de l’obtention du Push Token:", e.message);
    }
  } else {
    console.log("Les notifications push nécessitent un appareil physique.");
  }

  return token;
}
