import { HapticTab } from "@/components/haptic-tab";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as Location from 'expo-location';
import Constants from 'expo-constants';
// On supprime l'import statique de Notifications qui fait crasher Expo Go


import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";
import { updatePushToken, updateUserLocation } from "@/services/user.service";
import { getUserIdFromStorage } from "@/utils/storage";

export default function TabLayout() {
  const { t } = useTranslation();
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
    let subscription: { remove: () => void } | undefined;
    if (Constants.appOwnership !== 'expo') {
      const Notifications = require('expo-notifications');
      subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
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
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t("tabs.map"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alertes"
        options={{
          title: t("tabs.alerts"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bell" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="user" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
