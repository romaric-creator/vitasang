import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getData } from "@/utils/storage";
import Splash from "./Splash";

export default function Index() {
  const { isAuth, isLoading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    getData("onboarding_seen").then((val) => {
      setHasSeenOnboarding(!!val);
      setCheckingOnboarding(false);
    });
  }, []);

  if (isLoading || checkingOnboarding) return <Splash />;
  if (isAuth) return <Redirect href="/(tabs)" />;
  if (hasSeenOnboarding) return <Redirect href="/login" />;
  return <Redirect href="/OnboardingCarousel" />;
}
