/**
 * NetworkBanner
 * Displays a slim offline indicator banner at the top of the screen.
 * Uses periodic fetch pings + AppState to detect connectivity without
 * requiring @react-native-community/netinfo.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";

// URL used solely to probe connectivity (tiny HEAD request)
const PROBE_URL = "https://clients3.google.com/generate_204";
const PROBE_TIMEOUT_MS = 4000;
const POLL_INTERVAL_MS = 10000; // recheck every 10 s while offline

async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(PROBE_URL, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(id);
    return res.status < 400;
  } catch {
    return false;
  }
}

export const NetworkBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-40)).current;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animate = useCallback(
    (show: boolean) => {
      Animated.timing(slideAnim, {
        toValue: show ? 0 : -40,
        duration: color.timing.smooth,
        useNativeDriver: true,
      }).start();
    },
    [slideAnim],
  );

  const probe = useCallback(async () => {
    const online = await checkConnectivity();
    setIsOffline((prev) => {
      if (prev !== !online) animate(!online);
      return !online;
    });
  }, [animate]);

  // Start / stop polling
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(probe, POLL_INTERVAL_MS);
  }, [probe]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial check
    probe();

    // Re-probe when app comes to foreground
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active") probe();
    };
    const subscription = AppState.addEventListener("change", handleAppState);

    // Poll while component is mounted
    startPolling();

    return () => {
      subscription.remove();
      stopPolling();
    };
  }, [probe, startPolling, stopPolling]);

  // When we go offline start more aggressive polling; stop when online
  useEffect(() => {
    if (isOffline) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [isOffline, startPolling, stopPolling]);

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={t("network.offline", "Mode hors-ligne - données en cache")}
      pointerEvents="none"
    >
      <View style={styles.inner}>
        <View style={styles.dot} />
        <Text style={styles.text} numberOfLines={1}>
          {t("network.offline", "Mode hors-ligne — données en cache")}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: color.warning,
    zIndex: 9999,
    elevation: 20,
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.textWhite,
    opacity: 0.9,
  },
  text: {
    color: color.textWhite,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
