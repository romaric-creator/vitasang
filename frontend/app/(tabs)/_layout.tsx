import { HapticTab } from "@/components/haptic-tab";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";
import { updatePushToken, updateUserLocation } from "@/services/user.service";
import { getUserIdFromStorage } from "@/utils/storage";

export default function TabLayout() {
  const router = useRouter();
  useEffect(() => {
    const setupNotifications = async () => {
      // Les notifications Push (FCM) ne sont plus supportées dans Expo Go (SDK 53+).
      // On évite d'appeler register pour ne pas polluer les logs.
      if (Constants.appOwnership === 'expo') {
        console.log("[Notifications] Skipped in Expo Go (Non supporté)");
        return;
      }

      const userId = await getUserIdFromStorage();
      if (!userId) return;

      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await updatePushToken(userId, token);
        }
      } catch (error) {
        console.error("[Notifications] Setup error:", error);
      }
    };

    // On n'active l'écouteur que si on n'est pas sous Expo Go
    let subscription;
    if (Constants.appOwnership !== 'expo') {
      subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        if (data?.alertId) {
          router.push(`/alert-response/${data.alertId}?distance=${data.distance || ''}`);
        }
      });
    }

    setupNotifications();

    return () => subscription?.remove();
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
