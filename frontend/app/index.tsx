import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getData } from "@/utils/storage";
import { View, ActivityIndicator } from "react-native";
import { color } from "@/constant/color";

export default function Index() {
  const [isAuth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getData("token");
      setAuth(!!token);
    };
    checkAuth();
  }, []);

  if (isAuth === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return <Redirect href={isAuth ? "/(tabs)" : "/Splash"} />;
}
