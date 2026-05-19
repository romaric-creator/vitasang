import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { color } from "@/constant/color";
import { TabBarIcon } from "@/components/TabBarIcon";
import { storeData } from "@/utils/storage";

const { width: VIEWPORT_WIDTH } = Dimensions.get("window");

// ---------------------------------------------------------------------------
// Config des slides — texte statique, pas de i18n (données en dur demandées)
// ---------------------------------------------------------------------------
const SLIDES = [
  {
    id: "1",
    counter: "01 / 03",
    bgColor: "#FFF1F2",
    title: "Sauvez une vie\nen un clic",
    description:
      "Répondez aux alertes de sang urgentes et devenez un héros pour votre communauté.",
    expression: "normal" as const,
  },
  {
    id: "2",
    counter: "02 / 03",
    bgColor: "#FFF7ED",
    title: "L'urgence\nn'attend pas",
    description:
      "Chaque minute compte. VitaSang connecte les donneurs aux hôpitaux en temps réel.",
    expression: "surprised" as const,
  },
  {
    id: "3",
    counter: "03 / 03",
    bgColor: "#F0FDF4",
    title: "Rejoignez\nle mouvement",
    description:
      "Plus de 1 000 donneurs au Cameroun. Ensemble, nous construisons un réseau de vie.",
    expression: "happy" as const,
  },
] as const;

type Expression = "normal" | "surprised" | "happy";

// ---------------------------------------------------------------------------
// BloodDropMascot — entièrement en Views RN, sans image ni emoji
// ---------------------------------------------------------------------------
interface MascotProps {
  expression: Expression;
  isLastSlide: boolean;
}

const BloodDropMascot: React.FC<MascotProps> = ({ expression, isLastSlide }) => {
  const bounceY = useRef(new Animated.Value(0)).current;
  const squeezeX = useRef(new Animated.Value(1)).current;
  const danceRot = useRef(new Animated.Value(0)).current;
  const prevExpression = useRef<Expression>(expression);

  // Bounce vertical idle
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, {
          toValue: -8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(bounceY, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  // Squeeze lors du changement de slide
  useEffect(() => {
    if (prevExpression.current !== expression) {
      prevExpression.current = expression;
      Animated.sequence([
        Animated.timing(squeezeX, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(squeezeX, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [expression]);

  // Danse sur le dernier slide
  useEffect(() => {
    if (isLastSlide) {
      const dance = Animated.loop(
        Animated.sequence([
          Animated.timing(danceRot, {
            toValue: -5,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(danceRot, {
            toValue: 5,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(danceRot, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ])
      );
      dance.start();
      return () => dance.stop();
    } else {
      danceRot.setValue(0);
    }
  }, [isLastSlide]);

  const danceRotInterp = danceRot.interpolate({
    inputRange: [-5, 5],
    outputRange: ["-5deg", "5deg"],
  });

  // Yeux selon expression
  const eyeStyle = (side: "left" | "right") => {
    if (expression === "happy") {
      // Yeux mi-clos en forme de sourire (croissant)
      return (
        <View
          style={[
            styles.eyeHappy,
            side === "left" ? { marginRight: 10 } : { marginLeft: 10 },
          ]}
        />
      );
    }
    const eyeH = expression === "surprised" ? 16 : 12;
    const pupilH = expression === "surprised" ? 9 : 7;
    return (
      <View
        style={[
          styles.eyeBase,
          { height: eyeH },
          side === "left" ? { marginRight: 10 } : { marginLeft: 10 },
        ]}
      >
        <View style={[styles.pupil, { height: pupilH, width: pupilH }]} />
        {expression === "surprised" && (
          <View style={styles.eyebrowSurprised} />
        )}
      </View>
    );
  };

  // Bouche selon expression
  const mouthView = () => {
    if (expression === "happy") {
      // Sourire : arc via overflow hidden + borderRadius
      return (
        <View style={styles.smileWrapper}>
          <View style={styles.smileArc} />
        </View>
      );
    }
    if (expression === "surprised") {
      // Bouche ronde ouverte
      return <View style={styles.mouthSurprised} />;
    }
    // Neutre : petite ligne
    return <View style={styles.mouthNeutral} />;
  };

  return (
    <Animated.View
      style={[
        styles.mascotRoot,
        {
          transform: [
            { translateY: bounceY },
            { scaleX: squeezeX },
            { rotate: danceRotInterp },
          ],
        },
      ]}
    >
      {/* Bras gauche */}
      <View style={[styles.arm, styles.armLeft]} />

      {/* Corps principal : cercle + pointe */}
      <View style={styles.mascotBodyWrapper}>
        <View style={styles.mascotBody}>
          {/* Brillance */}
          <View style={styles.mascotShine} />

          {/* Visage */}
          <View style={styles.face}>
            {/* Sourcils (expression normale : cachés ; surprise : visibles) */}
            {expression === "surprised" && (
              <View style={styles.eyebrowsRow}>
                <View style={[styles.eyebrow, styles.eyebrowLeft]} />
                <View style={[styles.eyebrow, styles.eyebrowRight]} />
              </View>
            )}
            {/* Yeux */}
            <View style={styles.eyesRow}>
              {eyeStyle("left")}
              {eyeStyle("right")}
            </View>
            {/* Bouche */}
            <View style={styles.mouthRow}>{mouthView()}</View>
          </View>
        </View>
        {/* Pointe de la goutte */}
        <View style={styles.mascotTip} />
      </View>

      {/* Bras droit */}
      <View style={[styles.arm, styles.armRight]} />
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Écran principal
// ---------------------------------------------------------------------------
export default function OnboardingCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Marquer l'onboarding comme vu dès le montage
  useEffect(() => {
    storeData("onboarding_seen", true);
  }, []);

  const handleNext = useCallback(() => {
    if (activeSlide < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeSlide + 1,
        animated: true,
      });
    } else {
      router.replace("/login");
    }
  }, [activeSlide]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / VIEWPORT_WIDTH
    );
    setActiveSlide(index);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof SLIDES)[number]; index: number }) => {
      const isLast = index === SLIDES.length - 1;
      return (
        <View style={[styles.slide, { backgroundColor: item.bgColor }]}>
          {/* Compteur slide */}
          <Text style={styles.slideCounter}>{item.counter}</Text>

          {/* Mascotte */}
          <View style={styles.mascotArea}>
            <BloodDropMascot
              expression={item.expression}
              isLastSlide={isLast}
            />
          </View>

          {/* Texte */}
          <View style={styles.textArea}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        </View>
      );
    },
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Bouton Passer */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.replace("/login")}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        accessibilityRole="button"
        accessibilityLabel="Passer l'introduction"
      >
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Dots de progression */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [
            (i - 1) * VIEWPORT_WIDTH,
            i * VIEWPORT_WIDTH,
            (i + 1) * VIEWPORT_WIDTH,
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveSlide(i);
              }}
              accessibilityRole="tab"
              accessibilityLabel={`Slide ${i + 1} sur ${SLIDES.length}`}
            >
              <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer : bouton principal + SOS */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {activeSlide === SLIDES.length - 1 ? "Commencer" : "Suivant"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => router.push("/guest-alert")}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Urgence : Lancer une alerte SOS"
        >
          <TabBarIcon name="exclamation-triangle" size={16} color={color.primary} />
          <Text style={styles.sosButtonText}>Urgence : Lancer une alerte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1F2",
  },
  flatList: {
    flex: 1,
  },

  // Bouton passer
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 38,
    right: 20,
    zIndex: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: color.textSecondary,
  },

  // Slide
  slide: {
    width: VIEWPORT_WIDTH,
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  slideCounter: {
    fontSize: 13,
    fontWeight: "700",
    color: color.primaryLight,
    letterSpacing: 1.5,
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  mascotArea: {
    height: 210,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  textArea: {
    alignItems: "flex-start",
    width: "100%",
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 14,
  },
  slideDescription: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 23,
    fontWeight: "400",
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: color.primary,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 48 : 28,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: color.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sosButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: color.primary,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  sosButtonText: {
    color: color.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  // -----------------------------------------------------------------------
  // Mascotte
  // -----------------------------------------------------------------------
  mascotRoot: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  // Bras
  arm: {
    width: 18,
    height: 40,
    backgroundColor: color.primary,
    borderRadius: 10,
    position: "absolute",
    bottom: 40,
  },
  armLeft: {
    left: -8,
    transform: [{ rotate: "25deg" }],
  },
  armRight: {
    right: -8,
    transform: [{ rotate: "-25deg" }],
  },

  // Corps de la goutte
  mascotBodyWrapper: {
    alignItems: "center",
  },
  mascotBody: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: color.primary,
    overflow: "hidden",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  mascotShine: {
    position: "absolute",
    top: 14,
    left: 16,
    width: 26,
    height: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.28)",
    transform: [{ rotate: "-20deg" }],
  },
  mascotTip: {
    width: 44,
    height: 44,
    backgroundColor: color.primary,
    borderRadius: 6,
    transform: [{ rotate: "45deg" }],
    marginTop: -24,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: -1,
  },

  // Visage
  face: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  eyebrowsRow: {
    flexDirection: "row",
    marginBottom: 4,
    width: 60,
    justifyContent: "space-between",
  },
  eyebrow: {
    width: 18,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 2,
  },
  eyebrowLeft: {
    transform: [{ rotate: "-15deg" }, { translateY: -3 }],
  },
  eyebrowRight: {
    transform: [{ rotate: "15deg" }, { translateY: -3 }],
  },
  eyesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  // Oeil normal / surpris : rectangle arrondi blanc avec pupille
  eyeBase: {
    width: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pupil: {
    borderRadius: 99,
    backgroundColor: "#1E293B",
  },
  eyebrowSurprised: {
    position: "absolute",
    top: -6,
    width: 12,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 2,
  },
  // Oeil heureux : croissant
  eyeHappy: {
    width: 14,
    height: 7,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderTopWidth: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  mouthRow: {
    alignItems: "center",
  },
  // Bouche neutre
  mouthNeutral: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  // Bouche surprise : ovale ouvert
  mouthSurprised: {
    width: 16,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  // Sourire : overflow hidden + demi-cercle
  smileWrapper: {
    width: 34,
    height: 17,
    overflow: "hidden",
  },
  smileArc: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "transparent",
  },
});
