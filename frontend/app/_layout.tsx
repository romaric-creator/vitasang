import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import Splash from "./Splash";
import { View } from "react-native";

import { PostHogProvider, usePostHog } from "posthog-react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { color } from "@/constant/color";
import { queryClient } from "@/config/queryClient";
import { getUserIdFromStorage } from "@/utils/storage";

import "../i18n";

function RootLayoutNav() {
  const { isAuth, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const posthog = usePostHog();
  const [appReady, setAppReady] = useState(false);

  const { show: showAlert } =
    require("@/context/NotificationContext").useNotification();

  useEffect(() => {
    if (isLoading) return;

    const runBackgroundTasks = async () => {
      try {
        const userId = await getUserIdFromStorage();
        if (!userId) {
          setAppReady(true);
          return;
        }

        // 1. Initialiser le cache image (Différé)
        const {
          initImageCache,
          manageImageCacheSize,
        } = require("@/hooks/useCachedImage");
        initImageCache()
          .then(() => manageImageCacheSize(50))
          .catch(() => {});

        // 2. Token Push (Différé)
        const Constants = require("expo-constants").default;
        if (Constants.appOwnership !== "expo") {
          const {
            registerForPushNotificationsAsync,
          } = require("@/utils/pushNotifications");
          const { updatePushToken } = require("@/services/user.service");
          registerForPushNotificationsAsync()
            .then((token: string) => {
              if (token) updatePushToken(Number(userId), token);
            })
            .catch(() => {});
        }

        // 3. Localisation (Différé)
        const Location = require("expo-location");
        Location.requestForegroundPermissionsAsync()
          .then(({ status }: any) => {
            if (status === "granted") {
              Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              })
                .then((location: any) => {
                  const {
                    updateUserLocation,
                  } = require("@/services/user.service");
                  updateUserLocation(
                    Number(userId),
                    location.coords.latitude,
                    location.coords.longitude,
                  );
                })
                .catch(() => {});
            }
          })
          .catch(() => {});

        // 4. Alert Retry Check (Différé)
        const {
          checkAlertsBackground,
        } = require("@/services/alertRetryService");
        checkAlertsBackground(showAlert);

        // 5. Pré-chargement des centres (React Query)
        const { queryClient: qc } = require("@/config/queryClient");
        const { queryKeys } = require("@/config/reactQuery");
        const {
          getAllCentres: getCentres,
        } = require("@/services/user.service");
        qc.prefetchQuery({
          queryKey: queryKeys.centres.list(),
          queryFn: async () => {
            const res = await getCentres();
            return res.centres;
          },
        }).catch(() => {});
      } catch (e) {}
    };

    runBackgroundTasks();
    setAppReady(true); // On marque l'app comme prête immédiatement après avoir lancé les tâches
  }, [isLoading, showAlert]);

  // Screen Tracking (Différé)
  useEffect(() => {
    if (segments && segments.length > 0) {
      const screenName = segments.join("/");
      posthog?.screen(screenName);
    }
  }, [segments, posthog]);

  // Effet pour gérer les redirections basées sur l'authentification
  useEffect(() => {
    if (isLoading || !appReady) return; // Attendre loading d'auth ET initApp

    const currentSegment = segments[0]?.toLowerCase() || "";

    const inAuthFlow =
      currentSegment === "(auth)" ||
      currentSegment === "login" ||
      currentSegment === "register" ||
      currentSegment === "splash" ||
      currentSegment === "onboardingcarousel" ||
      currentSegment === "guest-alert" ||
      currentSegment === "alert-confirmation" ||
      currentSegment === "Splash";

    if (isAuth && inAuthFlow) {
      // Si authentifié et dans le flux d'auth, rediriger vers l'application principale
      router.replace("/(tabs)");
    } else if (!isAuth && !inAuthFlow) {
      // Si non authentifié et pas dans le flux d'auth, rediriger vers l'onboarding directement
      router.replace("/OnboardingCarousel");
    }
  }, [isAuth, isLoading, appReady, segments]);

  // Afficher l'écran de Splash pendant le chargement initial
  if (isLoading || !appReady) {
    return <Splash showButtons={false} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Définition de tous les écrans de l'application */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="guest-alert" />
      <Stack.Screen name="alert-confirmation" />
      <Stack.Screen name="Splash" />
      <Stack.Screen name="OnboardingCarousel" />
      <Stack.Screen
        name="create-alert/index"
        options={{ presentation: "modal", title: "Lancer une alerte" }}
      />
      <Stack.Screen name="alert-tracking/[id]" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="alert-response/[id]" />
      <Stack.Screen name="book-appointment/[centreId]" />
      <Stack.Screen name="historique" />
      <Stack.Screen name="rendezvous" />
      <Stack.Screen name="notifications-settings" />
      <Stack.Screen name="language-settings" />
      <Stack.Screen name="eligibility-test" />
      <Stack.Screen name="aide-et-conseil" />
      {__DEV__ && <Stack.Screen name="debug-api" />}
    </Stack>
  );
}

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// Le RootLayout principal qui fournit les contextes d'authentification, notifications et React Query
export default function RootLayout() {
  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY as string;
  const hasPostHog = posthogKey && posthogKey.trim().length > 0;

  const providers = (
    <AuthProvider>
      <NotificationProvider>
        <RootLayoutNav />
      </NotificationProvider>
    </AuthProvider>
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {hasPostHog ? (
        <PostHogProvider
          apiKey={posthogKey}
          options={{
            host: "https://us.i.posthog.com",
            enableSessionReplay: true,
            persistence: "memory",
          }}
        >
          {providers}
        </PostHogProvider>
      ) : (
        providers
      )}
    </PersistQueryClientProvider>
  );
}
