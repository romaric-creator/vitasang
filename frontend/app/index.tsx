import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Splash from "./Splash";

export default function Index() {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <Splash showButtons={false} />;
  }

  if (isAuth) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/OnboardingCarousel" />;
}
