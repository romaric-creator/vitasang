import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const HEAD  = 118;
const EYE_W = 20;
const EYE_H = 24;
const PUPIL = 13;
const ARM_W = 20;
const ARM_H = 48;

type Expression = "normal" | "happy" | "surprised";

interface Props {
  expression?: Expression;
  accentColor?: string;
  wobble?: boolean;
}

export const BloodDropMascot: React.FC<Props> = ({
  expression = "happy",
  accentColor = "#E53935",
  wobble: enableWobble = false,
}) => {
  const floatY   = useRef(new Animated.Value(0)).current;
  const blinkY   = useRef(new Animated.Value(1)).current;
  const squeezeX = useRef(new Animated.Value(1)).current;
  const squeezeY = useRef(new Animated.Value(1)).current;
  const wobbleA  = useRef(new Animated.Value(0)).current;
  const armL     = useRef(new Animated.Value(0)).current;
  const armR     = useRef(new Animated.Value(0)).current;
  const shadowSc = useRef(new Animated.Value(1)).current;
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
    const targets: Record<Expression, [number, number]> = {
      normal: [30, -30], surprised: [80, -80], happy: [50, -50],
    };
    const [l, r] = targets[expression];
    Animated.parallel([
      Animated.spring(armL, { toValue: l, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.spring(armR, { toValue: r, useNativeDriver: true, speed: 14, bounciness: 8 }),
    ]).start();
  }, [expression]);

  useEffect(() => {
    if (enableWobble) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleA, { toValue: -8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobbleA, { toValue:  8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobbleA, { toValue: -8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobbleA, { toValue:  8, duration: 150, useNativeDriver: true }),
          Animated.timing(wobbleA, { toValue:  0, duration: 150, useNativeDriver: true }),
          Animated.delay(800),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(wobbleA, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [enableWobble]);

  const wobbleDeg = wobbleA.interpolate({ inputRange: [-8, 8], outputRange: ["-8deg", "8deg"] });
  const armLDeg   = armL.interpolate({ inputRange: [0, 80],  outputRange: ["30deg",  "-60deg"] });
  const armRDeg   = armR.interpolate({ inputRange: [-80, 0], outputRange: ["60deg",  "-30deg"] });
  const armColor  = accentColor + "E0";

  const eyeH = expression === "surprised" ? 28 : EYE_H;
  const eyeW = expression === "surprised" ? EYE_W - 2 : EYE_W;

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
        <Animated.View style={[ms.eyeWhite, { width: eyeW, height: eyeH, transform: [{ scaleY: blinkY }] }]}>
          <View style={[ms.pupil, expression === "surprised" && ms.pupilLarge]} />
          <View style={ms.eyeShine} />
        </Animated.View>
        <Animated.View style={[ms.eyeWhite, { width: eyeW, height: eyeH, transform: [{ scaleY: blinkY }] }]}>
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
        <Animated.View style={[ms.arm, ms.armLeft, { backgroundColor: armColor, transform: [{ translateY: -(ARM_H / 2) }, { rotate: armLDeg }] }]} />
        <View style={ms.dropContainer}>
          <View style={[ms.head, { backgroundColor: accentColor }]}>
            <View style={ms.shine} />
            <View style={ms.shine2} />
            {expression === "happy" && (
              <>
                <View style={[ms.cheek, { left: 10 }]} />
                <View style={[ms.cheek, { right: 10 }]} />
              </>
            )}
            <View style={ms.face}>
              {expression === "surprised" && (
                <View style={ms.browsRow}>
                  <View style={[ms.brow, { transform: [{ rotate: "-15deg" }, { translateY: -3 }] }]} />
                  <View style={[ms.brow, { transform: [{ rotate: "15deg"  }, { translateY: -3 }] }]} />
                </View>
              )}
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

const ms = StyleSheet.create({
  mascotWrap:    { alignItems: "center" },
  dropContainer: { alignItems: "center" },
  head: {
    width: HEAD, height: HEAD, borderRadius: HEAD / 2,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22, shadowRadius: 16, elevation: 12,
  },
  tipWrapper: {
    width: 38, height: 38, marginTop: -24, zIndex: -1,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", borderRadius: 6, transform: [{ rotate: "45deg" }],
  },
  tipInner: { width: 38, height: 38 },
  shine: {
    position: "absolute", top: 14, left: 16, width: 24, height: 14,
    borderRadius: 10, backgroundColor: "rgba(255,255,255,0.32)",
    transform: [{ rotate: "-25deg" }],
  },
  shine2: {
    position: "absolute", top: 20, left: 26, width: 9, height: 6,
    borderRadius: 4, backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "-25deg" }],
  },
  cheek: {
    position: "absolute", bottom: 26, width: 18, height: 12,
    borderRadius: 9, backgroundColor: "rgba(255,180,180,0.48)",
  },
  face:     { alignItems: "center", justifyContent: "center", gap: 5 },
  browsRow: { flexDirection: "row", gap: 20, marginBottom: 2 },
  brow:     { width: 18, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.95)" },
  eyesRow:  { flexDirection: "row", gap: 14, alignItems: "center" },
  eyeWhite: {
    width: EYE_W, height: EYE_H, borderRadius: EYE_W / 2,
    backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  pupil:      { width: PUPIL, height: PUPIL, borderRadius: PUPIL / 2, backgroundColor: "#1C1C2E" },
  pupilLarge: { width: PUPIL + 2, height: PUPIL + 2, borderRadius: (PUPIL + 2) / 2 },
  eyeShine: {
    position: "absolute", top: 3, right: 3, width: 5, height: 5,
    borderRadius: 3, backgroundColor: "rgba(255,255,255,0.75)",
  },
  eyeHappyClip: { width: 20, height: 12, overflow: "hidden" },
  eyeHappyArc: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 4, borderColor: "#FFFFFF", backgroundColor: "transparent", marginTop: 4,
  },
  mouthWrap:    { alignItems: "center" },
  mouthNeutral: { width: 24, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.80)" },
  mouthO:       { width: 16, height: 20, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.90)" },
  smileClip:    { width: 40, height: 20, overflow: "hidden", alignItems: "center" },
  smileCircle: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 5, borderColor: "rgba(255,255,255,0.95)", backgroundColor: "transparent",
  },
  arm:      { position: "absolute", width: ARM_W, height: ARM_H, borderRadius: ARM_W / 2 },
  armLeft:  { left:  -(ARM_W * 0.5), top: HEAD * 0.28 },
  armRight: { right: -(ARM_W * 0.5), top: HEAD * 0.28 },
  shadow: {
    width: 68, height: 12, borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.10)", marginTop: 8,
  },
});
