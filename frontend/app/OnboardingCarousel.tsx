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

const { width: VW } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    counter: "01",
    total: "03",
    bgColor: "#FFF1F2",
    accentColor: "#FECDD3",
    title: "Sauvez une vie\nen un clic",
    description:
      "Répondez aux alertes de sang urgentes et devenez un héros pour votre communauté.",
    expression: "normal" as const,
  },
  {
    id: "2",
    counter: "02",
    total: "03",
    bgColor: "#FFF7ED",
    accentColor: "#FED7AA",
    title: "L'urgence\nn'attend pas",
    description:
      "Chaque minute compte. VitaSang connecte les donneurs aux hôpitaux en temps réel.",
    expression: "surprised" as const,
  },
  {
    id: "3",
    counter: "03",
    total: "03",
    bgColor: "#F0FDF4",
    accentColor: "#BBF7D0",
    title: "Rejoignez\nle mouvement",
    description:
      "Plus de 1 000 donneurs au Cameroun. Ensemble, nous construisons un réseau de vie.",
    expression: "happy" as const,
  },
] as const;

type Expression = "normal" | "surprised" | "happy";

// ─── Mascotte ────────────────────────────────────────────────────────────────

const BloodDropMascot: React.FC<{
  expression: Expression;
  isLastSlide: boolean;
}> = ({ expression, isLastSlide }) => {
  const bounceY   = useRef(new Animated.Value(0)).current;
  const squeezeX  = useRef(new Animated.Value(1)).current;
  const squeezeY  = useRef(new Animated.Value(1)).current;
  const danceRot  = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const armLAnim  = useRef(new Animated.Value(0)).current;
  const armRAnim  = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const prevExpr  = useRef<Expression>(expression);

  // Bounce + ombre synchronisée
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bounceY,     { toValue: -12, duration: 800, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 0.75, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bounceY,     { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  // Clignement des yeux toutes les 3s
  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.05, duration: 80,  useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 80,  useNativeDriver: true }),
      ]).start(() => {
        setTimeout(blink, 2800 + Math.random() * 1200);
      });
    };
    const t = setTimeout(blink, 1500);
    return () => clearTimeout(t);
  }, []);

  // Squeeze élastique au changement d'expression
  useEffect(() => {
    if (prevExpr.current !== expression) {
      prevExpr.current = expression;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(squeezeX, { toValue: 0.75, duration: 130, useNativeDriver: true }),
          Animated.timing(squeezeY, { toValue: 1.15, duration: 130, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(squeezeX, { toValue: 1.1,  duration: 120, useNativeDriver: true }),
          Animated.timing(squeezeY, { toValue: 0.9,  duration: 120, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(squeezeX, { toValue: 1,    duration: 100, useNativeDriver: true }),
          Animated.timing(squeezeY, { toValue: 1,    duration: 100, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [expression]);

  // Bras selon expression
  useEffect(() => {
    if (expression === "normal") {
      // Bras au repos
      Animated.parallel([
        Animated.timing(armLAnim, { toValue: 0,   duration: 300, useNativeDriver: true }),
        Animated.timing(armRAnim, { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start();
    } else if (expression === "surprised") {
      // Bras levés (surprise)
      Animated.parallel([
        Animated.timing(armLAnim, { toValue: -50, duration: 350, useNativeDriver: true }),
        Animated.timing(armRAnim, { toValue: -50, duration: 350, useNativeDriver: true }),
      ]).start();
    } else {
      // Bras en V victoire
      Animated.parallel([
        Animated.timing(armLAnim, { toValue: -35, duration: 300, useNativeDriver: true }),
        Animated.timing(armRAnim, { toValue: -35, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [expression]);

  // Danse + saut sur le dernier slide
  useEffect(() => {
    if (isLastSlide) {
      const dance = Animated.loop(
        Animated.sequence([
          Animated.timing(danceRot, { toValue: -8,  duration: 180, useNativeDriver: true }),
          Animated.timing(danceRot, { toValue: 8,   duration: 180, useNativeDriver: true }),
          Animated.timing(danceRot, { toValue: -8,  duration: 180, useNativeDriver: true }),
          Animated.timing(danceRot, { toValue: 8,   duration: 180, useNativeDriver: true }),
          Animated.timing(danceRot, { toValue: 0,   duration: 180, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
      dance.start();
      return () => dance.stop();
    } else {
      Animated.timing(danceRot, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isLastSlide]);

  const danceRotDeg = danceRot.interpolate({
    inputRange: [-8, 8],
    outputRange: ["-8deg", "8deg"],
  });
  const armLDeg = armLAnim.interpolate({
    inputRange: [-50, 0],
    outputRange: ["-80deg", "25deg"],
  });
  const armRDeg = armRAnim.interpolate({
    inputRange: [-50, 0],
    outputRange: ["80deg", "-25deg"],
  });

  // ── Yeux ──────────────────────────────────────────────────────────────────
  const renderEyes = () => {
    if (expression === "happy") {
      return (
        <View style={s.eyesRow}>
          {/* Yeux arc */}
          <View style={s.eyeHappyWrap}>
            <Animated.View style={[s.eyeHappyArc, { transform: [{ scaleY: blinkAnim }] }]} />
          </View>
          {/* Joue gauche */}
          <View style={[s.cheek, { left: 8 }]} />
          <View style={s.eyeHappyWrap}>
            <Animated.View style={[s.eyeHappyArc, { transform: [{ scaleY: blinkAnim }] }]} />
          </View>
          {/* Joue droite */}
          <View style={[s.cheek, { right: 8 }]} />
        </View>
      );
    }
    const eyeH  = expression === "surprised" ? 18 : 14;
    const pupH  = expression === "surprised" ? 10 : 8;
    const pupW  = expression === "surprised" ? 10 : 7;
    return (
      <View style={s.eyesRow}>
        {/* Oeil gauche */}
        <Animated.View style={[s.eyeOuter, { height: eyeH, transform: [{ scaleY: blinkAnim }] }]}>
          <View style={[s.pupil, { width: pupW, height: pupH }]} />
          {/* Reflet */}
          <View style={s.pupilReflect} />
        </Animated.View>
        {/* Oeil droit */}
        <Animated.View style={[s.eyeOuter, { height: eyeH, transform: [{ scaleY: blinkAnim }] }]}>
          <View style={[s.pupil, { width: pupW, height: pupH }]} />
          <View style={s.pupilReflect} />
        </Animated.View>
      </View>
    );
  };

  // ── Bouche ────────────────────────────────────────────────────────────────
  const renderMouth = () => {
    if (expression === "happy") {
      return (
        <View style={s.smileClip}>
          <View style={s.smileCircle} />
        </View>
      );
    }
    if (expression === "surprised") {
      return <View style={s.mouthO} />;
    }
    return <View style={s.mouthLine} />;
  };

  // ── Sourcils ──────────────────────────────────────────────────────────────
  const renderBrows = () => {
    if (expression === "surprised") {
      return (
        <View style={s.browsRow}>
          <View style={[s.brow, { transform: [{ rotate: "-12deg" }, { translateY: -2 }] }]} />
          <View style={[s.brow, { transform: [{ rotate: "12deg" },  { translateY: -2 }] }]} />
        </View>
      );
    }
    if (expression === "happy") {
      return (
        <View style={s.browsRow}>
          <View style={[s.brow, { transform: [{ rotate: "8deg" }],  opacity: 0.7 }]} />
          <View style={[s.brow, { transform: [{ rotate: "-8deg" }], opacity: 0.7 }]} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={s.mascotWrap}>
      {/* Corps + animation */}
      <Animated.View
        style={{
          transform: [
            { translateY: bounceY },
            { scaleX: squeezeX },
            { scaleY: squeezeY },
            { rotate: danceRotDeg },
          ],
          alignItems: "center",
        }}
      >
        {/* Bras gauche */}
        <Animated.View
          style={[s.arm, s.armL, { transform: [{ rotate: armLDeg }] }]}
        />

        {/* Corps goutte */}
        <View style={s.bodyWrap}>
          {/* Cercle principal */}
          <View style={s.bodyCircle}>
            {/* Brillances */}
            <View style={s.shine1} />
            <View style={s.shine2} />

            {/* Croix médicale */}
            <View style={s.crossH} />
            <View style={s.crossV} />

            {/* Visage */}
            <View style={s.face}>
              {renderBrows()}
              {renderEyes()}
              <View style={s.mouthWrap}>{renderMouth()}</View>
            </View>
          </View>

          {/* Pointe bas */}
          <View style={s.tipOuter}>
            <View style={s.tip} />
          </View>
        </View>

        {/* Bras droit */}
        <Animated.View
          style={[s.arm, s.armR, { transform: [{ rotate: armRDeg }] }]}
        />
      </Animated.View>

      {/* Ombre au sol */}
      <Animated.View
        style={[s.shadow, { transform: [{ scaleX: shadowScale }] }]}
      />
    </View>
  );
};

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function OnboardingCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    storeData("onboarding_seen", true);
  }, []);

  const handleNext = useCallback(() => {
    if (activeSlide < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeSlide + 1, animated: true });
    } else {
      router.replace("/login");
    }
  }, [activeSlide]);

  const onMomentumScrollEnd = useCallback((e: any) => {
    setActiveSlide(Math.round(e.nativeEvent.contentOffset.x / VW));
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof SLIDES)[number]; index: number }) => (
      <View style={[s.slide, { backgroundColor: item.bgColor }]}>
        {/* Compteur */}
        <View style={s.counterRow}>
          <Text style={s.counterCurrent}>{item.counter}</Text>
          <Text style={s.counterSep}> / </Text>
          <Text style={s.counterTotal}>{item.total}</Text>
        </View>

        {/* Zone mascotte */}
        <View style={s.mascotArea}>
          <BloodDropMascot
            expression={item.expression}
            isLastSlide={index === SLIDES.length - 1}
          />
        </View>

        {/* Carte texte */}
        <View style={[s.textCard, { borderColor: item.accentColor }]}>
          <View style={[s.textCardAccent, { backgroundColor: item.accentColor }]} />
          <Text style={s.slideTitle}>{item.title}</Text>
          <Text style={s.slideDesc}>{item.description}</Text>
        </View>
      </View>
    ),
    []
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Passer */}
      <TouchableOpacity
        style={s.skipBtn}
        onPress={() => router.replace("/login")}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Text style={s.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES as unknown as (typeof SLIDES)[number][]}
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
        style={{ flex: 1 }}
      />

      {/* Dots */}
      <View style={s.dotsRow}>
        {SLIDES.map((_, i) => {
          const range = [(i - 1) * VW, i * VW, (i + 1) * VW];
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveSlide(i);
              }}
            >
              <Animated.View
                style={[
                  s.dot,
                  {
                    width: scrollX.interpolate({
                      inputRange: range,
                      outputRange: [7, 22, 7],
                      extrapolate: "clamp",
                    }),
                    opacity: scrollX.interpolate({
                      inputRange: range,
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: "clamp",
                    }),
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>
            {activeSlide === SLIDES.length - 1 ? "Commencer" : "Suivant"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.sosBtn}
          onPress={() => router.push("/guest-alert")}
          activeOpacity={0.8}
        >
          <TabBarIcon name="exclamation-triangle" size={15} color={color.primary} />
          <Text style={s.sosBtnText}>Urgence : Lancer une alerte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BODY_SIZE   = 118;
const ARM_W       = 20;
const ARM_H       = 44;
const ARM_RADIUS  = 10;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1F2",
  },

  // ── Bouton passer ─────────────────────────────────────────────────────────
  skipBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 36,
    right: 20,
    zIndex: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  skipText: {
    fontSize: 13,
    fontWeight: "700",
    color: color.textSecondary,
  },

  // ── Slide ─────────────────────────────────────────────────────────────────
  slide: {
    width: VW,
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 76 : 56,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  counterCurrent: {
    fontSize: 22,
    fontWeight: "900",
    color: color.primary,
    letterSpacing: -0.5,
  },
  counterSep: {
    fontSize: 16,
    fontWeight: "600",
    color: color.textLight,
    marginHorizontal: 2,
  },
  counterTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: color.textLight,
  },

  // ── Mascotte ──────────────────────────────────────────────────────────────
  mascotArea: {
    height: 220,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  mascotWrap: {
    alignItems: "center",
  },

  // Ombre au sol
  shadow: {
    width: 70,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(158,32,22,0.15)",
    marginTop: 6,
  },

  // Corps
  bodyWrap: {
    alignItems: "center",
  },
  bodyCircle: {
    width: BODY_SIZE,
    height: BODY_SIZE,
    borderRadius: BODY_SIZE / 2,
    backgroundColor: color.primary,
    overflow: "hidden",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 14,
  },

  // Brillances
  shine1: {
    position: "absolute",
    top: 14,
    left: 16,
    width: 28,
    height: 18,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.32)",
    transform: [{ rotate: "-22deg" }],
  },
  shine2: {
    position: "absolute",
    top: 22,
    left: 24,
    width: 10,
    height: 6,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "-22deg" }],
  },

  // Croix médicale (derrière le visage, semi-transparente)
  crossH: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 32,
    height: 10,
    marginTop: -20,
    marginLeft: -16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 3,
  },
  crossV: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 10,
    height: 32,
    marginTop: -31,
    marginLeft: -5,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 3,
  },

  // Pointe goutte
  tipOuter: {
    overflow: "hidden",
    width: 50,
    height: 28,
    marginTop: -14,
    alignItems: "center",
  },
  tip: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: color.primary,
    transform: [{ rotate: "45deg" }],
    marginTop: -24,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  // Bras
  arm: {
    position: "absolute",
    width: ARM_W,
    height: ARM_H,
    backgroundColor: color.primary,
    borderRadius: ARM_RADIUS,
  },
  armL: {
    left: -ARM_W + 4,
    top: BODY_SIZE * 0.3,
    transformOrigin: "50% 0%",
  },
  armR: {
    right: -ARM_W + 4,
    top: BODY_SIZE * 0.3,
    transformOrigin: "50% 0%",
  },

  // Visage
  face: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
  },
  browsRow: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 5,
  },
  brow: {
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  // Yeux normaux/surpris
  eyesRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginBottom: 7,
  },
  eyeOuter: {
    width: 13,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pupil: {
    borderRadius: 99,
    backgroundColor: "#1a1a2e",
  },
  pupilReflect: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  // Yeux heureux (arc)
  eyeHappyWrap: {
    width: 16,
    height: 10,
    overflow: "hidden",
  },
  eyeHappyArc: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3.5,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    marginTop: 3,
  },
  // Joues roses
  cheek: {
    position: "absolute",
    bottom: -2,
    width: 14,
    height: 9,
    borderRadius: 7,
    backgroundColor: "rgba(255,200,200,0.55)",
  },

  // Bouche neutre
  mouthWrap: {
    alignItems: "center",
  },
  mouthLine: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  // Bouche surprise
  mouthO: {
    width: 15,
    height: 19,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  // Sourire
  smileClip: {
    width: 36,
    height: 18,
    overflow: "hidden",
    marginTop: 2,
  },
  smileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.92)",
    backgroundColor: "transparent",
  },

  // ── Carte texte ───────────────────────────────────────────────────────────
  textCard: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    paddingLeft: 24,
    overflow: "hidden",
  },
  textCardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  slideTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: -0.5,
    lineHeight: 31,
    marginBottom: 10,
  },
  slideDesc: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    fontWeight: "500",
  },

  // ── Dots ──────────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
  },
  dot: {
    height: 7,
    borderRadius: 4,
    backgroundColor: color.primary,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === "ios" ? 46 : 26,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: color.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sosBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 13,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: color.primary,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  sosBtnText: {
    color: color.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
