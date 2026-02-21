import { getData } from "@/utils/storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function RootLayout() {
  const [isAuth, setAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAuth = async () => {
      const is = await getData("token");
      console.log(is);
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
      {isAuth ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Splash" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
