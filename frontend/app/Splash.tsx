import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { color } from "@/constant/color";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Splash() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in global
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulsation douce sur la goutte
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        {/* Bloc mascotte goutte de sang */}
        <Animated.View
          style={[
            styles.dropWrapper,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {/* Corps de la goutte : cercle + pointe simulée en bas */}
          <View style={styles.dropBody}>
            {/* Brillance haute gauche */}
            <View style={styles.dropShine} />
          </View>
          {/* Pointe de la goutte */}
          <View style={styles.dropTip} />
        </Animated.View>

        {/* Nom de l'app */}
        <Text style={styles.appName}>VitaSang</Text>
        <Text style={styles.tagline}>Donner le sang, c'est donner la vie</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  dropWrapper: {
    alignItems: "center",
    marginBottom: 32,
    // hauteur totale du bloc goutte
    height: 140,
    justifyContent: "flex-start",
  },
  dropBody: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: color.primary,
    // ombre légère
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  dropShine: {
    position: "absolute",
    top: 12,
    left: 14,
    width: 22,
    height: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.30)",
    transform: [{ rotate: "-20deg" }],
  },
  // Pointe bas de la goutte : triangle via View + rotation
  dropTip: {
    width: 36,
    height: 36,
    backgroundColor: color.primary,
    borderRadius: 4,
    transform: [{ rotate: "45deg" }],
    marginTop: -20,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
