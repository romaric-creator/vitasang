import { getData } from "@/utils/storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

// Initialisation i18n
import '../i18n';

export default function RootLayout() {
  const [isAuth, setAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      const is = await getData("token");
      setAuth(!!is);
      setLoading(false);
    };
    fetchAuth();
  }, []);

  if (loading) {
    return <View />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          // Cette route redirigera via le composant Redirect si nécessaire
        }}
      />
      <Stack.Screen name="Splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-alert" options={{ presentation: 'modal' }} />
      <Stack.Screen name="alert-tracking/[id]" />
      <Stack.Screen name="tracking" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="alert-response/[id]" />
      <Stack.Screen name="historique" />
      <Stack.Screen name="rendezvous" />
      <Stack.Screen name="centres" />
    </Stack>
  );
}
