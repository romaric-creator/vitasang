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
      const userId = await getUserIdFromStorage();
      if (!userId) return;

      try {
        // Tente de récupérer le token (fonctionnera sur device physique, retournera undefined sur simulateur)
        const token = await registerForPushNotificationsAsync();

        if (token) {
          console.log("[Notifications] Token obtenu, mise à jour backend...");
          await updatePushToken(userId, token);
        } else {
          console.log("[Notifications] Pas de token push disponible (Simulateur ou refus)");
        }
      } catch (error) {
        console.error("[Notifications] Erreur setup:", error);
      }
    };

    // Configuration des écouteurs de notifications
    let responseSubscription: { remove: () => void } | undefined;
    let receivedSubscription: { remove: () => void } | undefined;

    try {
      const Notifications = require('expo-notifications');

      // Gestion du clic sur notification (App en background/tuée)
      if (typeof Notifications.addNotificationResponseReceivedListener === 'function') {
        responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
          const data = response.notification.request.content.data;
          console.log("[Notifications] Clic détecté:", data);
          if (data?.alertId) {
            // Use replace to avoid going back to tabs
            router.replace({
              pathname: "/alert-response/[id]",
              params: { 
                id: String(data.alertId),
                distance: data.distance || ''
              }
            });
          }
        });
      }

      // Gestion de la réception (App au premier plan)
      if (typeof Notifications.addNotificationReceivedListener === 'function') {
        receivedSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
          console.log("[Notifications] Reçue au premier plan:", notification);
          // Ici on pourrait afficher un Toast ou une alerte in-app personnalisée
        });
      }

    } catch (e) {
      console.log("[Notifications] Module non disponible ou erreur init écouteurs");
    }

    setupNotifications();

    return () => {
      responseSubscription?.remove();
      receivedSubscription?.remove();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: color.secondary, // Teal pour le côté Santé/Confiance
        tabBarInactiveTintColor: color.textLight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 12,
          height: 76,
          elevation: 10,
          shadowColor: color.secondary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
          marginTop: 4,
          letterSpacing: 0.3,
          textTransform: "uppercase",
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
        name="messages/index"
        options={{
          title: t("tabs.messages") || "Messages",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="comment" size={26} color={color} />
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
      
      {/* Onglets masqués */}
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="messages/[id]" options={{ href: null }} />
    </Tabs>
  );
}
