import { HapticTab } from "@/components/haptic-tab";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";
import { updatePushToken, updateUserLocation } from "@/services/user.service";
import { getUserIdFromStorage } from "@/utils/storage";

export default function TabLayout() {
  const router = useRouter();
  useEffect(() => {
    const setupNotificationsAndLocation = async () => {
      const userId = await getUserIdFromStorage();
      if (!userId) return;

      // 1. Setup Push Notifications (Indépendant)
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await updatePushToken(userId, token);
          console.log("Push token registered successfully");
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }

      // 2. Setup Location (Indépendant)
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const success = await updateUserLocation(userId, location.coords.latitude, location.coords.longitude);
          if (success) {
            console.log("Location updated successfully");
          } else {
            console.warn("Location update failed (server rejected request)");
          }
        }
      } catch (error) {
        console.error("Error setting up location:", error);
      }
    };

    // 3. Listener pour les notifications reçues pendant que l'app est ouverte
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.alertId) {
        // Rediriger vers l'écran de réponse pour le destinataire
        router.push(`/alert-response/${data.alertId}?distance=${data.distance || ''}`);
      }
    });

    setupNotificationsAndLocation();

    return () => subscription.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.textLight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopColor: color.divider,
          borderTopWidth: 1.5,
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
          elevation: 0,
          shadowColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 4,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Centres",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alertes"
        options={{
          title: "Alertes",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bell" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="user" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
