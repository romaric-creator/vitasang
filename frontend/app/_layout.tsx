import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { color } from "@/constant/color";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { useAlertRetryCheck } from "@/hooks/useAlertRetryCheck";

// Initialisation i18n
import "../i18n";

// Ce composant gère la logique de navigation basée sur l'authentification
function RootLayoutNav() {
  const { isAuth, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const posthog = usePostHog();

  // Initialize alert retry check background task
  useAlertRetryCheck();

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

    // Détermine si l'utilisateur est actuellement dans un flux d'authentification ou d'urgence (Guest Alert)
    const inAuthGroup = segments[0] === "(auth)";
    const inAuthFlow =
      inAuthGroup ||
      segments[0] === "login" ||
      segments[0] === "register" ||
      segments[0] === "Splash" ||
      segments[0] === "OnboardingCarousel" ||
      segments[0] === "create-alert";

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
      <Stack.Screen name="tracking" />
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

// Le RootLayout principal qui fournit le contexte d'authentification et de notifications
export default function RootLayout() {
  return (
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
  );
}
