import {
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useCallback } from "react";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useUserProfile } from "@/hooks/useAuth";
import { useActiveAlerts } from "@/hooks/useAlerts";
import { AlertFatigueInsights } from "@/components/AlertFatigueInsights";
import Constants from "expo-constants";
import { usePostHog } from "posthog-react-native";
import { useAuth } from "@/context/AuthContext";

import { HomeHeader } from "@/components/home/HomeHeader";
import { DonorStatusCard } from "@/components/home/DonorStatusCard";
import { LaunchAlertButton } from "@/components/home/LaunchAlertButton";
import { UrgentAlertsSection } from "@/components/home/UrgentAlertsSection";
import { AideSensibilisationSection } from "@/components/home/AideSensibilisationSection";

export default function Home() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const posthog = usePostHog();

  const userId = authUser?.id_utilisateur ?? authUser?.id ?? null;

  const profileQuery = useUserProfile(userId as number, !!userId);
  const alertsQuery = useActiveAlerts();

  const refreshing = profileQuery.isRefetching || alertsQuery.isRefetching;
  const userData = profileQuery.data?.user;
  const activeAlerts = alertsQuery.data?.alerts || [];

  useFocusEffect(
    useCallback(() => {
      posthog?.capture("home_visited");
      profileQuery.refetch();
      alertsQuery.refetch();
    }, [posthog]),
  );

  const onRefresh = () => {
    profileQuery.refetch();
    alertsQuery.refetch();
  };

  const fullName = userData
    ? `${userData.prenom || ""} ${userData.nom || ""}`.trim()
    : t("profile.defaultUser");

  const profileImage = userData?.photo_profil
    ? {
      uri: userData.photo_profil.startsWith("http")
        ? userData.photo_profil
        : (
          Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL ||
          "https://vitasang-api.onrender.com/"
        ).replace("/api", "") + userData.photo_profil,
    }
    : null;

  return (
    <ThemedView style={styles.container}>
      <HomeHeader
        fullName={fullName}
        profileImage={profileImage}
        hasActiveAlerts={activeAlerts.length > 0}
        t={t}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[color.primary]}
            tintColor={color.primary}
          />
        }
      >
        <DonorStatusCard
          groupeSanguin={userData?.groupe_sanguin}
          disponible={userData?.disponible ?? true}
          donsCount={userData?.donsCount ?? 0}
          lastDonationDate={userData?.lastDonationDate}
          t={t}
        />

        <LaunchAlertButton t={t} />

        <UrgentAlertsSection activeAlerts={activeAlerts} t={t} />

        {activeAlerts.length > 0 && <AlertFatigueInsights visible={true} />}

        <AideSensibilisationSection t={t} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  scrollContent: {
    paddingHorizontal: color.spacing.l,
    paddingBottom: color.spacing.xxl,
    paddingTop: color.spacing.s,
  },
});

