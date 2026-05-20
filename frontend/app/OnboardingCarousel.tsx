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

const { width: VW, height: VH } = Dimensions.get("window");

// ─── Données slides ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "1",
    bgColor: "#FFF1F2",
    bgCircle: "#FECDD3",
    accentColor: color.primary,
    expression: "normal" as const,
    title: "Une vie à sauver\nen 30 secondes",
    description: "Signalez un besoin de sang urgent depuis n'importe où. L'alerte part immédiatement aux donneurs compatibles autour de vous.",
    badge: "SOS",
    badgeBg: color.primary,
    icons: [
      { name: "exclamation-triangle" as const, x: -90, y: -30, size: 28, bg: "#FFF1F2", border: "#FECDD3" },
      { name: "tint"                as const, x:  80, y: -50, size: 22, bg: "#FFF1F2", border: "#FECDD3" },
      { name: "map-marker"          as const, x: -70, y:  60, size: 20, bg: "#FFF1F2", border: "#FECDD3" },
    ],
  },
  {
    id: "2",
    bgColor: "#F0F9FF",
    bgCircle: "#BAE6FD",
    accentColor: "#0284C7",
    expression: "surprised" as const,
    title: "Le bon donneur,\nau bon endroit",
    description: "Géolocalisation + groupe sanguin compatible. Chaque donneur reçoit une notification push en temps réel dès qu'une urgence le concerne.",
    badge: "O+",
    badgeBg: "#0284C7",
    icons: [
      { name: "bell"         as const, x: -85, y: -40, size: 26, bg: "#F0F9FF", border: "#BAE6FD" },
      { name: "map-marker"   as const, x:  75, y: -30, size: 24, bg: "#F0F9FF", border: "#BAE6FD" },
      { name: "mobile"       as const, x:  65, y:  65, size: 22, bg: "#F0F9FF", border: "#BAE6FD" },
    ],
  },
  {
    id: "3",
    bgColor: "#F0FDF4",
    bgCircle: "#BBF7D0",
    accentColor: "#16A34A",
    expression: "happy" as const,
    title: "Chaque don\nlaisse une trace",
    description: "Historique complet, confirmations de don, messagerie directe avec les familles. Votre engagement, documenté.",
    badge: "✓",
    badgeBg: "#16A34A",
    icons: [
      { name: "check-circle" as const, x: -80, y: -45, size: 28, bg: "#F0FDF4", border: "#BBF7D0" },
      { name: "comment"      as const, x:  78, y: -35, size: 24, bg: "#F0FDF4", border: "#BBF7D0" },
      { name: "history"      as const, x: -65, y:  65, size: 22, bg: "#F0FDF4", border: "#BBF7D0" },
    ],
  },
] as const;

type Expression = "normal" | "surprised" | "happy";

// ─── Constantes mascotte ──────────────────────────────────────────────────────
const HEAD   = 118;
const EYE_W  = 20;
const EYE_H  = 24;
const PUPIL  = 13;
const ARM_W  = 20;
const ARM_H  = 48;

// ─── Icônes flottantes autour de la mascotte ──────────────────────────────────
const FloatingIcons: React.FC<{
  icons: typeof SLIDES[0]["icons"];
  accentColor: string;
  visible: boolean;
}> = ({ icons, accentColor, visible }) => {
  const anims = useRef(icons.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      Animated.stagger(80, anims.map(a =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 })
      )).start();
    } else {
      anims.forEach(a => a.setValue(0));
    }
  }, [visible]);

  return (
    <>
      {icons.map((icon, i) => (
        <Animated.View
          key={i}
          style={[
            styles.floatIcon,
            {
              left: VW / 2 + icon.x - 20,
              top: VH * 0.38 + icon.y,
              backgroundColor: icon.bg,
              borderColor: icon.border,
              transform: [
                { scale: anims[i] },
                { translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
              ],
              opacity: anims[i],
            },
          ]}
        >
          <TabBarIcon name={icon.name} size={icon.size} color={accentColor} />
        </Animated.View>
      ))}
    </>
  );
};

// ─── Badge groupe sanguin ─────────────────────────────────────────────────────
const SlideBadge: React.FC<{ label: string; bg: string; visible: boolean }> = ({ label, bg, visible }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 12,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: bg, transform: [{ scale: anim }], opacity: anim },
      ]}
    >
      <Text style={styles.badgeText}>{label}</Text>
    </Animated.View>
  );
};

// ─── Mascotte ─────────────────────────────────────────────────────────────────
const BloodDropMascot: React.FC<{
  expression: Expression;
  accentColor: string;
  isLastSlide: boolean;
}> = ({ expression, accentColor, isLastSlide }) => {
  const floatY   = useRef(new Animated.Value(0)).current;
  const blinkY   = useRef(new Animated.Value(1)).current;
  const squeezeX = useRef(new Animated.Value(1)).current;
  const squeezeY = useRef(new Animated.Value(1)).current;
  const wobble   = useRef(new Animated.Value(0)).current;
  const armL     = useRef(new Animated.Value(0)).current;
  const armR     = useRef(new Animated.Value(0)).current;
  const shadowSc = useRef(new Animated.Value(1)).current;
  const prevExpr = useRef<Expression>(expression);
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY,   { toValue: -10, duration: 1100, useNativeDriver: true }),
        Animated.timing(shadowSc, { toValue: 0.8, duration: 1100, useNativeDriver: true }),
        Animated.timing(floatY,   { toValue: 0,   duration: 1100, useNativeDriver: true }),
        Animated.timing(shadowSc, { toValue: 1,   duration: 1100, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

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
        Animated.timing(squeezeX, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(squeezeY, { toValue: 1, duration: 90, useNativeDriver: true }),
      ]),
    ]).start();
  }, [expression]);

  useEffect(() => {
    const targets = { normal: [30, -30], surprised: [80, -80], happy: [50, -50] };
    const [l, r] = targets[expression];
    Animated.parallel([
      Animated.spring(armL, { toValue: l, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.spring(armR, { toValue: r, useNativeDriver: true, speed: 14, bounciness: 8 }),
    ]).start();
  }, [expression]);

  useEffect(() => {
    if (isLastSlide) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(wobble, { toValue: -8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobble, { toValue:  8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobble, { toValue: -8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobble, { toValue:  8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobble, { toValue:  0, duration: 150, useNativeDriver: true }),
          Animated.delay(800),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(wobble, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [isLastSlide]);

  const wobbleDeg = wobble.interpolate({ inputRange: [-8, 8], outputRange: ["-8deg", "8deg"] });
  const armLDeg   = armL.interpolate({ inputRange: [0, 80],  outputRange: ["30deg",  "-60deg"] });
  const armRDeg   = armR.interpolate({ inputRange: [-80, 0], outputRange: ["60deg",  "-30deg"] });

  const eyeHCurrent = expression === "surprised" ? 28 : EYE_H;
  const eyeWCurrent = expression === "surprised" ? EYE_W - 2 : EYE_W;

  const renderEyes = () => {
    if (expression === "happy") {
      return (
        <View style={ms.eyesRow}>
          <Animated.View style={[ms.eyeHappyClip, { transform: [{ scaleY: blinkY }] }]}>
            <View style={ms.eyeHappyArc} />
          </Animated.View>
          <Animated.View style={[ms.eyeHappyClip, { transform: [{ scaleY: blinkY }] }]}>
            <View style={ms.eyeHappyArc} />
          </Animated.View>
        </View>
      );
    }
    return (
      <View style={ms.eyesRow}>
        <Animated.View style={[ms.eyeWhite, { width: eyeWCurrent, height: eyeHCurrent, transform: [{ scaleY: blinkY }] }]}>
          <View style={[ms.pupil, expression === "surprised" && ms.pupilLarge]} />
          <View style={ms.eyeShine} />
        </Animated.View>
        <Animated.View style={[ms.eyeWhite, { width: eyeWCurrent, height: eyeHCurrent, transform: [{ scaleY: blinkY }] }]}>
          <View style={[ms.pupil, expression === "surprised" && ms.pupilLarge]} />
          <View style={ms.eyeShine} />
        </Animated.View>
      </View>
    );
  };

  const renderMouth = () => {
    if (expression === "happy") {
      return (
        <View style={ms.smileClip}>
          <View style={ms.smileCircle} />
        </View>
      );
    }
    if (expression === "surprised") return <View style={ms.mouthO} />;
    return <View style={ms.mouthNeutral} />;
  };

  const renderCheeks = () => {
    if (expression !== "happy") return null;
    return (
      <>
        <View style={[ms.cheek, { left: 10 }]} />
        <View style={[ms.cheek, { right: 10 }]} />
      </>
    );
  };

  const renderBrows = () => {
    if (expression === "surprised") {
      return (
        <View style={ms.browsRow}>
          <View style={[ms.brow, { transform: [{ rotate: "-15deg" }, { translateY: -3 }] }]} />
          <View style={[ms.brow, { transform: [{ rotate: "15deg"  }, { translateY: -3 }] }]} />
        </View>
      );
    }
    return null;
  };

  const armColor = accentColor + "E0";

  return (
    <View style={ms.mascotWrap}>
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
        <Animated.View style={[ms.arm, ms.armLeft,  { backgroundColor: armColor, transform: [{ translateY: -(ARM_H / 2) }, { rotate: armLDeg }] }]} />
        <View style={ms.dropContainer}>
          <View style={[ms.head, { backgroundColor: accentColor }]}>
            <View style={ms.shine} />
            <View style={ms.shine2} />
            {renderCheeks()}
            <View style={ms.face}>
              {renderBrows()}
              {renderEyes()}
              <View style={ms.mouthWrap}>{renderMouth()}</View>
            </View>
          </View>
          <View style={[ms.tipWrapper, { backgroundColor: accentColor }]}>
            <View style={[ms.tipInner, { backgroundColor: accentColor }]} />
          </View>
        </View>
        <Animated.View style={[ms.arm, ms.armRight, { backgroundColor: armColor, transform: [{ translateY: -(ARM_H / 2) }, { rotate: armRDeg }] }]} />
      </Animated.View>
      <Animated.View style={[ms.shadow, { transform: [{ scaleX: shadowSc }] }]} />
    </View>
  );
};

// ─── Slide ────────────────────────────────────────────────────────────────────
const Slide: React.FC<{
  item: typeof SLIDES[number];
  index: number;
  isActive: boolean;
}> = ({ item, index, isActive }) => (
  <View style={[styles.slide, { backgroundColor: item.bgColor, width: VW }]}>
    {/* Cercle décoratif en arrière-plan */}
    <View style={[styles.bgCircle, { backgroundColor: item.bgCircle }]} />

    {/* Zone mascotte avec icônes */}
    <View style={styles.mascotArea}>
      <BloodDropMascot
        expression={item.expression}
        accentColor={item.accentColor}
        isLastSlide={index === SLIDES.length - 1}
      />
      <SlideBadge label={item.badge} bg={item.badgeBg} visible={isActive} />
    </View>

    {/* Icônes flottantes */}
    <FloatingIcons icons={item.icons} accentColor={item.accentColor} visible={isActive} />

    {/* Texte */}
    <View style={styles.textBlock}>
      {/* Numéro d'étape */}
      <View style={[styles.stepPill, { backgroundColor: item.accentColor + "20" }]}>
        <Text style={[styles.stepText, { color: item.accentColor }]}>
          {index + 1} / {SLIDES.length}
        </Text>
      </View>
      <Text style={[styles.slideTitle, { color: "#0F172A" }]}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.description}</Text>
    </View>
  </View>
);

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
    ({ item, index }: { item: typeof SLIDES[number]; index: number }) => (
      <Slide item={item} index={index} isActive={activeSlide === index} />
    ),
    [activeSlide]
  );

  const currentSlide = SLIDES[activeSlide];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Passer */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.replace("/login")}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES as unknown as typeof SLIDES[number][]}
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
      <View style={styles.dotsRow}>
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
                  styles.dot,
                  { backgroundColor: currentSlide.accentColor },
                  {
                    width: scrollX.interpolate({
                      inputRange: range,
                      outputRange: [7, 26, 7],
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
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: currentSlide.accentColor }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>
            {activeSlide === SLIDES.length - 1 ? "Commencer →" : "Suivant"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sosBtn, { borderColor: currentSlide.accentColor + "60" }]}
          onPress={() => router.push("/guest-alert")}
          activeOpacity={0.8}
        >
          <TabBarIcon name="exclamation-triangle" size={14} color={currentSlide.accentColor} />
          <Text style={[styles.sosBtnText, { color: currentSlide.accentColor }]}>
            Urgence — Lancer une alerte sans compte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF1F2" },

  skipBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 36,
    right: 20,
    zIndex: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  skipText: { fontSize: 13, fontWeight: "700", color: "#64748B" },

  slide: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingHorizontal: 28,
    paddingBottom: 8,
    alignItems: "center",
    overflow: "hidden",
  },

  bgCircle: {
    position: "absolute",
    width: VW * 1.2,
    height: VW * 1.2,
    borderRadius: VW * 0.6,
    top: -VW * 0.35,
    left: -VW * 0.1,
    opacity: 0.35,
  },

  mascotArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Badge groupe sanguin positionné en haut-droite de la mascotte
  badge: {
    position: "absolute",
    top: -16,
    right: -18,
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // Icônes flottantes autour de la mascotte
  floatIcon: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  textBlock: {
    width: "100%",
    paddingBottom: 8,
    alignItems: "flex-start",
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  stepText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 12,
    textAlign: "left",
  },
  slideDesc: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "left",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
  },
  dot: { height: 7, borderRadius: 4 },

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
    shadowOpacity: 0.18,
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
    gap: 8,
    paddingVertical: 13,
    borderRadius: 28,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  sosBtnText: { fontSize: 13, fontWeight: "700" },
});

// ─── Styles mascotte ──────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  mascotWrap: { alignItems: "center" },
  dropContainer: { alignItems: "center" },
  head: {
    width: HEAD,
    height: HEAD,
    borderRadius: HEAD / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
  },
  tipWrapper: {
    width: 38,
    height: 38,
    marginTop: -24,
    zIndex: -1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 6,
    transform: [{ rotate: "45deg" }],
  },
  tipInner: { width: 38, height: 38 },
  shine: {
    position: "absolute",
    top: 14,
    left: 16,
    width: 24,
    height: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.32)",
    transform: [{ rotate: "-25deg" }],
  },
  shine2: {
    position: "absolute",
    top: 20,
    left: 26,
    width: 9,
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "-25deg" }],
  },
  cheek: {
    position: "absolute",
    bottom: 26,
    width: 18,
    height: 12,
    borderRadius: 9,
    backgroundColor: "rgba(255,180,180,0.48)",
  },
  face: { alignItems: "center", justifyContent: "center", gap: 5 },
  browsRow: { flexDirection: "row", gap: 20, marginBottom: 2 },
  brow: {
    width: 18,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  eyesRow: { flexDirection: "row", gap: 14, alignItems: "center" },
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
  pupilLarge: { width: PUPIL + 2, height: PUPIL + 2, borderRadius: (PUPIL + 2) / 2 },
  eyeShine: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  eyeHappyClip: { width: 20, height: 12, overflow: "hidden" },
  eyeHappyArc: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    marginTop: 4,
  },
  mouthWrap: { alignItems: "center" },
  mouthNeutral: {
    width: 24,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.80)",
  },
  mouthO: {
    width: 16,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.90)",
  },
  smileClip: { width: 40, height: 20, overflow: "hidden", alignItems: "center" },
  smileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "transparent",
  },
  arm: {
    position: "absolute",
    width: ARM_W,
    height: ARM_H,
    borderRadius: ARM_W / 2,
  },
  armLeft:  { left:  -(ARM_W * 0.5), top: HEAD * 0.28 },
  armRight: { right: -(ARM_W * 0.5), top: HEAD * 0.28 },
  shadow: {
    width: 68,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.10)",
    marginTop: 8,
  },
});
