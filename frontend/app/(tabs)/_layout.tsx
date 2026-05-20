import { HapticTab } from "@/components/haptic-tab";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();

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
