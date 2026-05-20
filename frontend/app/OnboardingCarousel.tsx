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
    bgColor: "#FFF1F2",
    accentColor: color.primary,
    title: "Sauvez une vie\nen un clic",
    description:
      "Répondez aux alertes de sang urgentes et devenez un héros pour votre communauté.",
    expression: "normal" as const,
  },
  {
    id: "2",
    bgColor: "#FFF7ED",
    accentColor: "#F97316",
    title: "L'urgence\nn'attend pas",
    description:
      "Chaque minute compte. VitaSang connecte les donneurs aux hôpitaux en temps réel.",
    expression: "surprised" as const,
  },
  {
    id: "3",
    bgColor: "#F0FDF4",
    accentColor: "#16A34A",
    title: "Rejoignez\nle mouvement",
    description:
      "Plus de 1 000 donneurs au Cameroun. Ensemble, nous construisons un réseau de vie.",
    expression: "happy" as const,
  },
] as const;

type Expression = "normal" | "surprised" | "happy";

// ─── Tailles ──────────────────────────────────────────────────────────────────
const HEAD = 130;   // diamètre de la tête / corps principal
const EYE_W = 22;   // largeur d'un oeil blanc
const EYE_H = 26;   // hauteur d'un oeil blanc (normal)
const PUPIL = 14;   // diamètre pupille
const ARM_W = 22;
const ARM_H = 52;

// ─── Mascotte ────────────────────────────────────────────────────────────────
const BloodDropMascot: React.FC<{
  expression: Expression;
  accentColor: string;
  isLastSlide: boolean;
}> = ({ expression, accentColor, isLastSlide }) => {
  const floatY     = useRef(new Animated.Value(0)).current;
  const blinkY     = useRef(new Animated.Value(1)).current;
  const squeezeX   = useRef(new Animated.Value(1)).current;
  const squeezeY   = useRef(new Animated.Value(1)).current;
  const wobble     = useRef(new Animated.Value(0)).current;
  const armL       = useRef(new Animated.Value(0)).current;
  const armR       = useRef(new Animated.Value(0)).current;
  const shadowSc   = useRef(new Animated.Value(1)).current;
  const prevExpr   = useRef<Expression>(expression);
  const blinkRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flottement doux
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY,   { toValue: -10, duration: 1000, useNativeDriver: true }),
        Animated.timing(shadowSc, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
        Animated.timing(floatY,   { toValue: 0,   duration: 1000, useNativeDriver: true }),
        Animated.timing(shadowSc, { toValue: 1,   duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Clignement des yeux
  useEffect(() => {
    const scheduleBlink = () => {
      blinkRef.current = setTimeout(() => {
        Animated.sequence([
          Animated.timing(blinkY, { toValue: 0.05, duration: 70,  useNativeDriver: true }),
          Animated.delay(40),
          Animated.timing(blinkY, { toValue: 1,    duration: 80,  useNativeDriver: true }),
        ]).start(() => scheduleBlink());
      }, 2200 + Math.random() * 1500);
    };
    scheduleBlink();
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current); };
  }, []);

  // Squash-and-stretch au changement d'expression
  useEffect(() => {
    if (prevExpr.current === expression) return;
    prevExpr.current = expression;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(squeezeX, { toValue: 0.82, duration: 110, useNativeDriver: true }),
        Animated.timing(squeezeY, { toValue: 1.18, duration: 110, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(squeezeX, { toValue: 1.12, duration: 100, useNativeDriver: true }),
        Animated.timing(squeezeY, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(squeezeX, { toValue: 1,    duration: 90,  useNativeDriver: true }),
        Animated.timing(squeezeY, { toValue: 1,    duration: 90,  useNativeDriver: true }),
      ]),
    ]).start();
  }, [expression]);

  // Bras
  useEffect(() => {
    const targets = {
      normal:    [30, -30],   // léger repos (degrés interpolés 0→30, 0→-30)
      surprised: [80, -80],   // levés
      happy:     [50, -50],   // en V victoire
    };
    const [l, r] = targets[expression];
    Animated.parallel([
      Animated.spring(armL, { toValue: l, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.spring(armR, { toValue: r, useNativeDriver: true, speed: 14, bounciness: 8 }),
    ]).start();
  }, [expression]);

  // Wobble sur dernier slide
  useEffect(() => {
    if (isLastSlide) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(wobble, { toValue: -9, duration: 160, useNativeDriver: true }),
          Animated.timing(wobble, { toValue:  9, duration: 160, useNativeDriver: true }),
          Animated.timing(wobble, { toValue: -9, duration: 160, useNativeDriver: true }),
          Animated.timing(wobble, { toValue:  9, duration: 160, useNativeDriver: true }),
          Animated.timing(wobble, { toValue:  0, duration: 160, useNativeDriver: true }),
          Animated.delay(700),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(wobble, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [isLastSlide]);

  const wobbleDeg = wobble.interpolate({ inputRange: [-9, 9], outputRange: ["-9deg", "9deg"] });

  // Interpolation des bras (valeur 0–80 → degrés de rotation du bras)
  const armLDeg = armL.interpolate({ inputRange: [0, 80], outputRange: ["30deg", "-60deg"] });
  const armRDeg = armR.interpolate({ inputRange: [-80, 0], outputRange: ["60deg", "-30deg"] });

  // ── Visage ────────────────────────────────────────────────────────────────
  const eyeHCurrent = expression === "surprised" ? 30 : EYE_H;
  const eyeWCurrent = expression === "surprised" ? EYE_W - 2 : EYE_W;

  const renderEyes = () => {
    if (expression === "happy") {
      // Yeux fermés en arc (^-^)
      return (
        <View style={s.eyesRow}>
          <Animated.View style={[s.eyeHappyClip, { transform: [{ scaleY: blinkY }] }]}>
            <View style={s.eyeHappyArc} />
          </Animated.View>
          <Animated.View style={[s.eyeHappyClip, { transform: [{ scaleY: blinkY }] }]}>
            <View style={s.eyeHappyArc} />
          </Animated.View>
        </View>
      );
    }
    return (
      <View style={s.eyesRow}>
        {/* Oeil gauche */}
        <Animated.View style={[s.eyeWhite, { width: eyeWCurrent, height: eyeHCurrent, transform: [{ scaleY: blinkY }] }]}>
          <View style={[s.pupil, expression === "surprised" && s.pupilLarge]} />
          <View style={s.eyeShine} />
        </Animated.View>
        {/* Oeil droit */}
        <Animated.View style={[s.eyeWhite, { width: eyeWCurrent, height: eyeHCurrent, transform: [{ scaleY: blinkY }] }]}>
          <View style={[s.pupil, expression === "surprised" && s.pupilLarge]} />
          <View style={s.eyeShine} />
        </Animated.View>
      </View>
    );
  };

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
    return <View style={s.mouthNeutral} />;
  };

  const renderCheeks = () => {
    if (expression !== "happy") return null;
    return (
      <>
        <View style={[s.cheek, { left: 12 }]} />
        <View style={[s.cheek, { right: 12 }]} />
      </>
    );
  };

  const renderBrows = () => {
    if (expression === "surprised") {
      return (
        <View style={s.browsRow}>
          <View style={[s.brow, { transform: [{ rotate: "-15deg" }, { translateY: -3 }] }]} />
          <View style={[s.brow, { transform: [{ rotate: "15deg" },  { translateY: -3 }] }]} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={s.mascotWrap}>
      {/* Corps animé */}
      <Animated.View
        style={{
          alignItems: "center",
          transform: [
            { translateY: floatY },
            { scaleX: squeezeX },
            { scaleY: squeezeY },
            { rotate: wobbleDeg },
          ],
        }}
      >
        {/* Bras gauche — derrière le corps */}
        <Animated.View style={[s.arm, s.armLeft, { transform: [{ rotate: armLDeg }] }]} />

        {/* ─── Forme goutte ─────────────────────────────────────────────────── */}
        <View style={s.dropContainer}>
          {/* Pointe en haut (inversé : la goutte a la pointe en haut sur ce design) */}
          {/* Corps rond */}
          <View style={[s.head, { backgroundColor: accentColor }]}>
            {/* Brillance principale */}
            <View style={s.shine} />
            {/* Brillance secondaire */}
            <View style={s.shine2} />

            {renderCheeks()}

            {/* Visage centré */}
            <View style={s.face}>
              {renderBrows()}
              {renderEyes()}
              <View style={s.mouthWrap}>{renderMouth()}</View>
            </View>
          </View>

          {/* Pointe bas de la goutte */}
          <View style={[s.tipWrapper, { backgroundColor: accentColor }]}>
            <View style={[s.tipInner, { backgroundColor: accentColor }]} />
          </View>
        </View>

        {/* Bras droit — devant le corps */}
        <Animated.View style={[s.arm, s.armRight, { transform: [{ rotate: armRDeg }] }]} />
      </Animated.View>

      {/* Ombre au sol */}
      <Animated.View style={[s.shadow, { transform: [{ scaleX: shadowSc }] }]} />
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
        {/* Zone mascotte */}
        <View style={s.mascotArea}>
          <BloodDropMascot
            expression={item.expression}
            accentColor={item.accentColor}
            isLastSlide={index === SLIDES.length - 1}
          />
        </View>

        {/* Texte */}
        <View style={s.textBlock}>
          <Text style={[s.slideTitle, { color: "#1E293B" }]}>{item.title}</Text>
          <Text style={s.slideDesc}>{item.description}</Text>
        </View>
      </View>
    ),
    []
  );

  const currentAccent = SLIDES[activeSlide].accentColor;

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
                  { backgroundColor: currentAccent },
                  {
                    width: scrollX.interpolate({
                      inputRange: range,
                      outputRange: [7, 24, 7],
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
          style={[s.primaryBtn, { backgroundColor: currentAccent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>
            {activeSlide === SLIDES.length - 1 ? "Commencer" : "Suivant"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.sosBtn, { borderColor: currentAccent }]}
          onPress={() => router.push("/guest-alert")}
          activeOpacity={0.8}
        >
          <TabBarIcon name="exclamation-triangle" size={15} color={currentAccent} />
          <Text style={[s.sosBtnText, { color: currentAccent }]}>Urgence : Lancer une alerte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1F2",
  },
  skipBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 36,
    right: 20,
    zIndex: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  skipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  // ── Slide ─────────────────────────────────────────────────────────────────
  slide: {
    width: VW,
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingHorizontal: 28,
    paddingBottom: 8,
    alignItems: "center",
  },

  // ── Mascotte ──────────────────────────────────────────────────────────────
  mascotArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotWrap: {
    alignItems: "center",
  },

  // ── Forme goutte ──────────────────────────────────────────────────────────
  dropContainer: {
    alignItems: "center",
    // Pas de overflow hidden ici — laisse les bras dépasser
  },

  // Tête / corps rond
  head: {
    width: HEAD,
    height: HEAD,
    borderRadius: HEAD / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },

  // Pointe bas de la goutte (triangle arrondi via View carrée tournée)
  tipWrapper: {
    width: 40,
    height: 40,
    marginTop: -26,
    zIndex: -1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 6,
    transform: [{ rotate: "45deg" }],
  },
  tipInner: {
    width: 40,
    height: 40,
  },

  // ── Brillances ────────────────────────────────────────────────────────────
  shine: {
    position: "absolute",
    top: 14,
    left: 18,
    width: 26,
    height: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
    transform: [{ rotate: "-25deg" }],
  },
  shine2: {
    position: "absolute",
    top: 20,
    left: 28,
    width: 10,
    height: 7,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.20)",
    transform: [{ rotate: "-25deg" }],
  },

  // ── Joues ─────────────────────────────────────────────────────────────────
  cheek: {
    position: "absolute",
    bottom: 28,
    width: 20,
    height: 13,
    borderRadius: 10,
    backgroundColor: "rgba(255,180,180,0.50)",
  },

  // ── Visage ────────────────────────────────────────────────────────────────
  face: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  browsRow: {
    flexDirection: "row",
    gap: 22,
    marginBottom: 2,
  },
  brow: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  // Yeux normaux
  eyesRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  eyeWhite: {
    width: EYE_W,
    height: EYE_H,
    borderRadius: EYE_W / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pupil: {
    width: PUPIL,
    height: PUPIL,
    borderRadius: PUPIL / 2,
    backgroundColor: "#1C1C2E",
  },
  pupilLarge: {
    width: PUPIL + 2,
    height: PUPIL + 2,
    borderRadius: (PUPIL + 2) / 2,
  },
  eyeShine: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  // Yeux heureux (arcs ^)
  eyeHappyClip: {
    width: 22,
    height: 13,
    overflow: "hidden",
  },
  eyeHappyArc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    marginTop: 4,
  },

  // ── Bouche ────────────────────────────────────────────────────────────────
  mouthWrap: {
    alignItems: "center",
  },
  mouthNeutral: {
    width: 26,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.80)",
  },
  mouthO: {
    width: 18,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.90)",
  },
  smileClip: {
    width: 42,
    height: 21,
    overflow: "hidden",
    alignItems: "center",
  },
  smileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "transparent",
  },

  // ── Bras ──────────────────────────────────────────────────────────────────
  arm: {
    position: "absolute",
    width: ARM_W,
    height: ARM_H,
    borderRadius: ARM_W / 2,
  },
  armLeft: {
    left: -(ARM_W * 0.5),
    top: HEAD * 0.25,
    // transformOrigin n'est pas supporté universellement, on simule via translateY
    transform: [{ translateY: -(ARM_H / 2) }],
  },
  armRight: {
    right: -(ARM_W * 0.5),
    top: HEAD * 0.25,
    transform: [{ translateY: -(ARM_H / 2) }],
  },

  // Ombre au sol
  shadow: {
    width: 72,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginTop: 8,
  },

  // ── Texte ─────────────────────────────────────────────────────────────────
  textBlock: {
    width: "100%",
    paddingBottom: 8,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 12,
    textAlign: "center",
  },
  slideDesc: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "center",
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
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === "ios" ? 46 : 28,
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
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
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  sosBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
