import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  G,
  Ellipse,
  Path,
  Circle,
  Rect,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const AnimatedG: any = Animated.createAnimatedComponent(G);

type Props = { width?: number; height?: number; animated?: boolean };

export default function SanguHero({
  width = 140,
  height = 140,
  animated = true,
}: Props) {
  const float = useRef(new Animated.Value(0)).current;
  const fist  = useRef(new Animated.Value(0)).current;
  const power = useRef(new Animated.Value(1)).current;
  const cape  = useRef(new Animated.Value(0)).current; // AJOUT : cape qui flotte

  useEffect(() => {
    if (!animated) return;

    // Flottement vertical
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Poing qui pulse
    const fistAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(fist, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fist, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Rayons d'énergie (clignotement)
    const powerAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(power, {
          toValue: 0.3,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(power, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    // AJOUT : Cape qui ondule (rotation légère)
    const capeAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(cape, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cape, {
          toValue: -1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    floatAnim.start();
    fistAnim.start();
    powerAnim.start();
    capeAnim.start();

    return () => {
      floatAnim.stop();
      fistAnim.stop();
      powerAnim.stop();
      capeAnim.stop();
    };
  }, [float, fist, power, cape, animated]);

  const translateY  = float.interpolate({ inputRange: [-1, 0, 1], outputRange: [-10, 0, 10] });
  const fistScale   = fist.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const powerOpacity = power;
  const capeRotate   = cape.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-4deg', '0deg', '4deg'],
  });

  return (
    <Animated.View style={{ width, height, transform: [{ translateY }] }}>
      <Svg width={width} height={height} viewBox="0 0 680 440">
        <Defs>
          <LinearGradient id="bodyGradR" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#B71C1C" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="capeGrad" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor="#B71C1C" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7F0000" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/*
         * BUG CORRIGÉ (double) :
         *   1. translate(567,238) → personnage affiché dans le quart DROIT du viewBox.
         *      Fix : translate(340,220) pour centrer dans le viewBox "0 0 680 440".
         *   2. L'ombre était définie en coordonnées absolues cx="567" cy="331"
         *      à l'extérieur du <G transform>, ce qui la désynchronisait de tout
         *      déplacement futur du personnage. Fix : ombre déplacée à l'intérieur
         *      du <G> en coordonnées relatives cx="0" cy="95".
         */}
        <G transform="translate(340,220)">
          {/* Ombre au sol (relative, dans le G) */}
          <Ellipse cx="0" cy="97" rx="56" ry="11" fill="#FFCDD2" opacity={0.55} />

          {/* Cape (AJOUT : animée) — dessinée en premier pour passer sous le corps */}
          <AnimatedG
            style={{
              transform: [
                { translateX: 0 },
                { translateY: 10 },
                { rotate: capeRotate },
                { translateX: 0 },
                { translateY: -10 },
              ],
            } as any}
          >
            <Path
              d="M -37,-4 Q -63,38 -52,82 Q -24,104 0,94 Q 24,104 52,82 Q 63,38 37,-4 Z"
              fill="url(#capeGrad)"
              stroke="#8B0000"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            {/* Reflet sur la cape */}
            <Path
              d="M -17,-2 Q -22,38 -15,76 Q -7,96 0,92 Q 7,96 15,76 Q 22,38 17,-2 Z"
              fill="#D32F2F"
              opacity={0.3}
            />
          </AnimatedG>

          {/* Bras gauche (vers le bas) */}
          <Path d="M -52,10 Q -82,28 -74,57" fill="none" stroke="#C62828" strokeWidth={21} strokeLinecap="round" />
          <Path d="M -52,10 Q -82,28 -74,57" fill="none" stroke="#EF3340" strokeWidth={13} strokeLinecap="round" />

          {/* Bras droit (levé) */}
          <Path d="M 52,6 Q 78,-13 83,-52" fill="none" stroke="#C62828" strokeWidth={21} strokeLinecap="round" />
          <Path d="M 52,6 Q 78,-13 83,-52" fill="none" stroke="#EF3340" strokeWidth={13} strokeLinecap="round" />

          {/* Corps */}
          <Path
            d="M 0,-88 C 46,-73 59,-24 59,28 Q 59,80 0,80 Q -59,80 -59,28 C -59,-24 -46,-73 0,-88 Z"
            fill="url(#bodyGradR)"
            stroke="#C62828"
            strokeWidth={5}
            strokeLinejoin="round"
          />

          {/* Croix/logo super-héros sur le corps */}
          <Rect x="-3.5" y={13} width={7}  height={23} rx={3.5} fill="white" opacity={0.95} />
          <Rect x="-11.5" y={19} width={23} height={7} rx={3.5} fill="white" opacity={0.95} />

          {/* Poing droit animé (pulse scale) */}
          <AnimatedG
            style={{
              transform: [
                { translateX: 84 },
                { translateY: -60 },
                { scale: fistScale },
                { translateX: -84 },
                { translateY: 60 },
              ],
            } as any}
          >
            <Circle cx="84" cy="-60" r={18} fill="#EF3340" stroke="#C62828" strokeWidth={4.5} />
            <Path
              d="M 72,-63 L 96,-57"
              stroke="#C62828"
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.45}
            />
          </AnimatedG>

          {/* Rayons d'énergie (clignotants) */}
          <AnimatedG style={{ opacity: powerOpacity } as any}>
            <Line x1={103} y1={-60} x2={116} y2={-60} stroke="#FFD600" strokeWidth={5} strokeLinecap="round" />
            <Line x1={101} y1={-70} x2={111} y2={-79} stroke="#FFD600" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
            <Line x1={101} y1={-50} x2={111} y2={-41} stroke="#FFD600" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
          </AnimatedG>

          {/* Pieds */}
          <Ellipse cx="-23" cy="84" rx="21" ry="11" fill="#C62828" transform="rotate(-5,-23,84)" />
          <Ellipse cx="23"  cy="84" rx="21" ry="11" fill="#C62828" transform="rotate(5,23,84)" />

          {/* Yeux */}
          <Circle cx="-21" cy="-23" r={21} fill="white" />
          <Circle cx="21"  cy="-23" r={21} fill="white" />
          <Circle cx="-17" cy="-21" r={9.5} fill="#1A1A2E" />
          <Circle cx="26"  cy="-21" r={9.5} fill="#1A1A2E" />
          <Circle cx="-10" cy="-28" r={4.5} fill="white" />
          <Circle cx="33"  cy="-28" r={4.5} fill="white" />

          {/* Joues */}
          <Ellipse cx="-43" cy="-8" rx={12} ry={8} fill="#EF9A9A" opacity={0.55} />
          <Ellipse cx="43"  cy="-8" rx={12} ry={8} fill="#EF9A9A" opacity={0.55} />

          {/* Sourire déterminé */}
          <Path d="M -20,10 Q 0,32 20,10" fill="none" stroke="#B71C1C" strokeWidth={5} strokeLinecap="round" />

          {/* Sourcils froncés (héroïque) */}
          <Path d="M -33,-44 Q -19,-51 -5,-44" fill="none" stroke="#B71C1C" strokeWidth={6} strokeLinecap="round" />
          <Path d="M 5,-44 Q 19,-51 33,-44"   fill="none" stroke="#B71C1C" strokeWidth={6} strokeLinecap="round" />
        </G>
      </Svg>
    </Animated.View>
  );
}
