import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { color } from "@/constant/color";

// Initialisation i18n
import '../i18n';

// Ce composant gère la logique de navigation basée sur l'authentification
function RootLayoutNav() {
  const { isAuth, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Effet pour gérer les redirections basées sur l'authentification
  useEffect(() => {
    if (isLoading) return; // Attendre que le statut d'auth soit chargé

    // Détermine si l'utilisateur est actuellement dans un flux d'authentification (login, register, Splash)
    const inAuthGroup = segments[0] === '(auth)';
    const inAuthFlow = inAuthGroup || segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'Splash' || segments[0] === 'OnboardingCarousel';

    if (isAuth && inAuthFlow) {
      // Si authentifié et dans le flux d'auth, rediriger vers l'application principale (les onglets)
      router.replace('/(tabs)');
    } else if (!isAuth && !inAuthFlow) {
      // Si non authentifié et pas dans le flux d'auth, rediriger vers la page de Splash
      router.replace('/Splash');
    }
  }, [isAuth, isLoading, segments]);

  // Afficher un spinner pendant le chargement initial de l'authentification
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: color.background }}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
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
      <Stack.Screen name="create-alert" options={{ presentation: 'modal' }} />
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
    </Stack>
  );
}

// Le RootLayout principal qui fournit le contexte d'authentification
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}