import { HapticTab } from "@/components/haptic-tab";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.textLight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: color.background,
          borderTopColor: color.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 8,
          shadowColor: color.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
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
