import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { color } from "@/constant/color";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import { useAlertRetryCheck } from "@/hooks/useAlertRetryCheck";
import { getUserIdFromStorage } from "@/utils/storage";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";
import * as Location from "expo-location";
import {
  updatePushToken,
  updateUserLocation,
  getActiveAlerts,
  getAllCentres,
} from "@/services/user.service";

// Initialisation i18n
import "../i18n";

// Ce composant gère la logique de navigation basée sur l'authentification
function RootLayoutNav() {
  const { isAuth, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const posthog = usePostHog();
  const [appReady, setAppReady] = useState(false);

  // Initialize alert retry check background task
  useAlertRetryCheck();

  // Application-level initialization that must run before landing on the home (tabs)
  useEffect(() => {
    if (isLoading) return; // wait for auth status

    let mounted = true;

    const initApp = async () => {
      try {
        const userId = await getUserIdFromStorage();

        const tasks: Promise<any>[] = [];

        if (userId) {
          // Push token registration
          tasks.push(
            (async () => {
              try {
                const token = await registerForPushNotificationsAsync();
                if (token) {
                  await updatePushToken(Number(userId), token);
                }
              } catch (e) {
                console.error("push init error", e);
              }
            })(),
          );

          // Location update
          tasks.push(
            (async () => {
              try {
                const { status } =
                  await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                  const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                  });
                  await updateUserLocation(
                    Number(userId),
                    location.coords.latitude,
                    location.coords.longitude,
                  );
                }
              } catch (e) {
                console.error("location init error", e);
              }
            })(),
          );

          // Fetch initial data that shouldn't block too long
          tasks.push(
            (async () => {
              try {
                await getActiveAlerts();
              } catch (e) {
                console.error("getActiveAlerts init", e);
              }
            })(),
          );
        }

        tasks.push(
          (async () => {
            try {
              await getAllCentres();
            } catch (e) {
              console.error("getAllCentres init", e);
            }
          })(),
        );

        await Promise.allSettled(tasks);
      } catch (e) {
        console.error("app init error", e);
      } finally {
        if (mounted) setAppReady(true);
      }
    };

    initApp();

    return () => {
      mounted = false;
    };
  }, [isLoading]);

  // Suivi automatique des écrans (Screen Tracking)
  useEffect(() => {
    if (segments && segments.length > 0) {
      const screenName = segments.join("/");
      posthog?.screen(screenName);
    }
  }, [segments, posthog]);

  // Effet pour gérer les redirections basées sur l'authentification
  useEffect(() => {
    if (isLoading) return; // Attendre que le statut d'auth soit chargé

    if (!segments.length && !isAuth) return; // Protection anti-montage à vide

    // Normalisation en minuscules
    const currentSegment = segments[0]?.toLowerCase() || "";

    const inAuthGroup = currentSegment === "(auth)";
    const inAuthFlow =
      inAuthGroup ||
      currentSegment === "login" ||
      currentSegment === "register" ||
      currentSegment === "splash" ||
      currentSegment === "onboardingcarousel";

    if (isAuth && inAuthFlow) {
      // Si authentifié et dans le flux d'auth, rediriger vers l'application principale (les onglets)
      router.replace("/(tabs)");
    } else if (!isAuth && !inAuthFlow) {
      // Si non authentifié et pas dans le flux d'auth, rediriger vers la page de Splash
      router.replace("/Splash");
    }
  }, [isAuth, isLoading, segments]);

  // Afficher un spinner pendant le chargement initial de l'authentification
  if (isLoading) {
    return <LoadingOverlay visible={true} fullScreen />;
  }

  // Attendre que l'initialisation globale soit terminée
  if (!appReady) {
    return <LoadingOverlay visible={true} fullScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Définition de tous les écrans de l'application */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="Splash" />
      <Stack.Screen name="OnboardingCarousel" />
      <Stack.Screen name="create-alert" options={{ presentation: "modal" }} />
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
    </Stack>
  );
}

// Le RootLayout principal qui fournit les contextes d'authentification, notifications et React Query
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider
        apiKey="phc_RCtl1OvR1kNIFgIEy1jwOODKDO2qnhBCvNurxY1j4Il"
        options={{
          host: "https://us.i.posthog.com",
          enableSessionReplay: true,
        }}
      >
        <AuthProvider>
          <NotificationProvider>
            <RootLayoutNav />
          </NotificationProvider>
        </AuthProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
