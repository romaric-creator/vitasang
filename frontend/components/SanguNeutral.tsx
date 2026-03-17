import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  G,
  Ellipse,
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

// FIX: AnimatedG manquait dans la version originale
const AnimatedG: any = Animated.createAnimatedComponent(G);

type Props = { width?: number; height?: number; animated?: boolean };

export default function SanguNeutral({
  width = 120,
  height = 120,
  animated = true,
}: Props) {
  const sway  = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current; // AJOUT : clignement des yeux
  const wave  = useRef(new Animated.Value(0)).current; // AJOUT : main qui fait signe

  useEffect(() => {
    if (!animated) return;

    // Balancement corps
    const swayAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: -1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // FIX : clignement naturel toutes les ~2.5 s
    const doBlink = () => {
      Animated.sequence([
        Animated.delay(2400),
        Animated.timing(blink, {
          toValue: 0.05,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: 70,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => { if (finished) doBlink(); });
    };

    // FIX : oscillation main (0→1→-1→0 en boucle propre)
    const waveAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, {
          toValue: 1,
          duration: 380,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wave, {
          toValue: -1,
          duration: 380,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    swayAnim.start();
    doBlink();
    waveAnim.start();

    return () => {
      swayAnim.stop();
      waveAnim.stop();
    };
  }, [sway, blink, wave, animated]);

  const bodyRotate = sway.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg'],
  });
  const eyeScaleY = blink; // scaleY → ferme les yeux
  const waveRotate = wave.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-18deg', '0deg', '18deg'],
  });

  return (
    <Animated.View style={{ width, height, transform: [{ rotate: bodyRotate }] }}>
      <Svg width={width} height={height} viewBox="0 0 680 440">
        <Defs>
          <LinearGradient id="bodyGradN" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#EF3340" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/*
          BUG CORRIGÉ : translate(113,240) → translate(340,220)
          Le personnage était affiché dans le quart gauche du SVG.
          Centre du viewBox "0 0 680 440" = (340, 220).
        */}
        <G transform="translate(340,220)">
          {/* Ombre au sol */}
          <Ellipse cx="0" cy="95" rx="54" ry="11" fill="#FFCDD2" opacity={0.55} />

          {/* Bras gauche (statique) */}
          <Path
            d="M -52,8 Q -82,28 -80,50"
            fill="none"
            stroke="#C62828"
            strokeWidth="21"
            strokeLinecap="round"
          />
          <Path
            d="M -52,8 Q -82,28 -80,50"
            fill="none"
            stroke="#EF3340"
            strokeWidth="13"
            strokeLinecap="round"
          />

          {/* Bras droit */}
          <Path
            d="M 52,8 Q 78,-8 84,-50"
            fill="none"
            stroke="#C62828"
            strokeWidth="21"
            strokeLinecap="round"
          />
          <Path
            d="M 52,8 Q 78,-8 84,-50"
            fill="none"
            stroke="#EF3340"
            strokeWidth="13"
            strokeLinecap="round"
          />

          {/* FIX : Main droite animée (wave) pivotant autour du poignet) */}
          <AnimatedG
            style={{
              transform: [
                { translateX: 85 },
                { translateY: -58 },
                { rotate: waveRotate },
                { translateX: -85 },
                { translateY: 58 },
              ],
            } as any}
          >
            <Circle cx="85" cy="-58" r="17" fill="#EF3340" stroke="#C62828" strokeWidth="4.5" />
            {/* Doigts */}
            <Path
              d="M 74,-68 Q 80,-74 86,-70"
              fill="none"
              stroke="#C62828"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <Path
              d="M 84,-70 Q 90,-76 95,-70"
              fill="none"
              stroke="#C62828"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <Path
              d="M 103,-54 Q 112,-50 108,-42"
              fill="none"
              stroke="#EF9A9A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <Path
              d="M 108,-58 Q 117,-54 113,-46"
              fill="none"
              stroke="#EF9A9A"
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.7}
            />
          </AnimatedG>

          {/* Corps */}
          <Path
            d="M 0,-88 C 46,-73 59,-24 59,28 Q 59,80 0,80 Q -59,80 -59,28 C -59,-24 -46,-73 0,-88 Z"
            fill="url(#bodyGradN)"
            stroke="#C62828"
            strokeWidth={5}
            strokeLinejoin="round"
          />

          {/* Pieds */}
          <Ellipse cx="-23" cy="84" rx="21" ry="11" fill="#C62828" transform="rotate(-9,-23,84)" />
          <Ellipse cx="23"  cy="84" rx="21" ry="11" fill="#C62828" transform="rotate(9,23,84)" />

          {/* Blancs des yeux */}
          <Circle cx="-21" cy="-23" r="21" fill="white" />
          <Circle cx="21"  cy="-23" r="21" fill="white" />

          {/* FIX : Pupils animées (clignement via scaleY) */}
          <AnimatedG
            style={{ transform: [{ scaleY: eyeScaleY }] } as any}
          >
            <Circle cx="-17" cy="-21" r="9.5" fill="#1A1A2E" />
            <Circle cx="26"  cy="-21" r="9.5" fill="#1A1A2E" />
            {/* Reflets */}
            <Circle cx="-10" cy="-28" r="4.5" fill="white" />
            <Circle cx="33"  cy="-28" r="4.5" fill="white" />
          </AnimatedG>

          {/* Joues */}
          <Ellipse cx="-43" cy="-8" rx="12" ry="8" fill="#EF9A9A" opacity={0.55} />
          <Ellipse cx="43"  cy="-8" rx="12" ry="8" fill="#EF9A9A" opacity={0.55} />

          {/* Sourire */}
          <Path
            d="M -20,10 Q 0,32 20,10"
            fill="none"
            stroke="#B71C1C"
            strokeWidth={5}
            strokeLinecap="round"
          />

          {/* Sourcils */}
          <Path
            d="M -33,-44 Q -19,-53 -5,-46"
            fill="none"
            stroke="#B71C1C"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          <Path
            d="M 5,-46 Q 19,-53 33,-44"
            fill="none"
            stroke="#B71C1C"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </Animated.View>
  );
}
