import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";

import { PostHogProvider, usePostHog } from "posthog-react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ToastProvider } from "@/context/ToastContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkBanner } from "@/components/NetworkBanner";
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

  // Handle notification tap when app is cold-launched
  useEffect(() => {
    const handleNotificationTap = async () => {
      try {
        const Constants = require("expo-constants").default;
        if (Constants.appOwnership === "expo") {
          console.log("[ColdLaunch] Notifications skip (Expo Go)");
          return;
        }

        const Notifications = require("expo-notifications");
        if (typeof Notifications.getInitialNotification === 'function') {
          const response = await Notifications.getInitialNotification();
          if (response) {
            const data = response.notification.request.content.data;
            console.log("[ColdLaunch] Notification tap:", data);
            if (data?.alertId) {
              router.push(
                `/alert-response/${data.alertId}?distance=${data.distance || ""}`,
              );
            }
          }
        }
      } catch (e) {
        console.log("[ColdLaunch] Error:", e);
      }
    };

    handleNotificationTap();
  }, []);

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
  // SIMPLIFIÉ: Plus de dépendance sur segments pour éviter les retriggers excessifs
  useEffect(() => {
    if (isLoading || !appReady) return;

    // Petit délai pour permettre au state de se stabiliser complètement
    const timer = setTimeout(() => {
      if (isAuth) {
        router.replace("/(tabs)");
      } else if (isAuth === false) {
        // Déconnexion explicite → login
        router.replace("/login");
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isAuth, isLoading, appReady]);

  if (isLoading || !appReady) return null;

  return (
    <>
      <StatusBar
        style="dark"
        translucent
        backgroundColor="transparent"
      />
      <NetworkBanner />
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
        <Stack.Screen name="alert-public/[token]" />
        <Stack.Screen name="book-appointment/[centreId]" />
        <Stack.Screen name="historique" />
        <Stack.Screen name="rendezvous" />
        <Stack.Screen name="notifications-settings" />
        <Stack.Screen name="language-settings" />
        <Stack.Screen name="eligibility-test" />
        <Stack.Screen name="aide-et-conseil" />
        <Stack.Screen name="reset-password" />
        {__DEV__ && <Stack.Screen name="debug-api" />}
      </Stack>
    </>
  );
}

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "VITASANG_QUERY_CACHE",
});

// Le RootLayout principal qui fournit les contextes d'authentification, notifications et React Query
export default function RootLayout() {
  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY as string;
  const hasPostHog = posthogKey && posthogKey.trim().length > 0;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 2,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      <PostHogProvider
        apiKey={posthogKey || "no-key"}
        options={{
          host: "https://us.i.posthog.com",
          enableSessionReplay: false,
          persistence: "memory",
          disabled: !hasPostHog,
        }}
      >
        <ErrorBoundary>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>
                <RootLayoutNav />
              </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </PostHogProvider>
    </PersistQueryClientProvider>
  );
}
