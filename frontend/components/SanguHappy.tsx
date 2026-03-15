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

const AnimatedG: any = Animated.createAnimatedComponent(G);

type Props = { width?: number; height?: number; animated?: boolean };

export default function SanguHappy({
  width = 140,
  height = 140,
  animated = true,
}: Props) {
  const jump    = useRef(new Animated.Value(0)).current;
  const star    = useRef(new Animated.Value(0)).current;
  const shadow  = useRef(new Animated.Value(1)).current; // AJOUT : ombre réactive au saut

  useEffect(() => {
    if (!animated) return;

    /*
     * BUG CORRIGÉ : la version originale faisait `loop(timing 0→1)` sans retour,
     * ce qui causait un reset abrupt (jump de 0 à valeur haute instantanément).
     * Fix : sequence 0→1→0 pour un saut fluide montée + descente.
     */
    const jumpAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(jump, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(jump, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.bounce),
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ]),
    );

    // Étoiles qui pulsent (ok, c'était correct)
    const starAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(star, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(star, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    /*
     * AJOUT : ombre au sol qui se rétrécit quand le personnage saute.
     * Synchronisée sur jump (inverse : quand jump↑, shadow↓).
     */
    const shadowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shadow, {
          toValue: 0.45,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shadow, {
          toValue: 1,
          duration: 600,
          easing: Easing.in(Easing.bounce),
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ]),
    );

    jumpAnim.start();
    starAnim.start();
    shadowAnim.start();

    return () => {
      jumpAnim.stop();
      starAnim.stop();
      shadowAnim.stop();
    };
  }, [jump, star, shadow, animated]);

  const translateY = jump.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -24, -36],
  });

  /*
   * BUG CORRIGÉ : la rotation des étoiles utilisait `rotate` dans le style d'AnimatedG
   * sans déplacer le pivot sur le centre de l'étoile → elles orbitaient autour de (0,0).
   * Fix : translate vers le centre de chaque étoile, tourne, translate retour.
   */
  const starRotate = star.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  const shadowScale = shadow;

  return (
    <Animated.View style={{ width, height, transform: [{ translateY }] }}>
      <Svg width={width} height={height} viewBox="0 0 680 440">
        <Defs>
          <LinearGradient id="bodyGradH" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor="#FF8A80" stopOpacity="1" />
            <Stop offset="100%" stopColor="#EF3340" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <G transform="translate(340,216)">
          {/* Ombre réactive au saut (scale animé) */}
          <AnimatedG style={{ transform: [{ scaleX: shadowScale }] } as any}>
            <Ellipse cx="0" cy="106" rx="46" ry="9" fill="#FFCDD2" opacity={0.45} />
          </AnimatedG>

          {/* Étoile gauche — FIX pivot : translate vers (-108,-64) / rotate / translate retour */}
          <AnimatedG
            style={{
              transform: [
                { translateX: -108 },
                { translateY: -64 },
                { rotate: starRotate },
                { translateX: 108 },
                { translateY: 64 },
              ],
            } as any}
          >
            <Path
              d="M -108,-76 L -104,-67 L -95,-64 L -102,-57 L -100,-48 L -108,-52 L -116,-48 L -114,-57 L -121,-64 L -112,-67 Z"
              fill="#FFD600"
              stroke="#F9A825"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </AnimatedG>

          {/* Étoile droite — même fix pivot */}
          <AnimatedG
            style={{
              transform: [
                { translateX: 108 },
                { translateY: -64 },
                { rotate: starRotate },
                { translateX: -108 },
                { translateY: 64 },
              ],
            } as any}
          >
            <Path
              d="M 108,-76 L 112,-67 L 121,-64 L 114,-57 L 116,-48 L 108,-52 L 100,-48 L 102,-57 L 95,-64 L 104,-67 Z"
              fill="#FFD600"
              stroke="#F9A825"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </AnimatedG>

          {/* Confettis */}
          <Circle cx="-88" cy="-46" r="5.5" fill="#FFD600" />
          <Circle cx="88"  cy="-46" r="5.5" fill="#FFD600" />
          <Circle cx="-70" cy="-94" r="4"   fill="#FF8A80" />
          <Circle cx="70"  cy="-94" r="4"   fill="#FF8A80" />
          <Circle cx="-98" cy="-106" r="3"  fill="#EF3340" opacity={0.5} />
          <Circle cx="98"  cy="-106" r="3"  fill="#EF3340" opacity={0.5} />

          {/* Bras gauche */}
          <Path d="M -52,5 Q -87,-24 -91,-66" fill="none" stroke="#C62828" strokeWidth={21} strokeLinecap="round" />
          <Path d="M -52,5 Q -87,-24 -91,-66" fill="none" stroke="#EF3340" strokeWidth={13} strokeLinecap="round" />
          <Circle cx="-92" cy="-74" r="16" fill="#EF3340" stroke="#C62828" strokeWidth={4.5} />

          {/* Bras droit */}
          <Path d="M 52,5 Q 87,-24 91,-66" fill="none" stroke="#C62828" strokeWidth={21} strokeLinecap="round" />
          <Path d="M 52,5 Q 87,-24 91,-66" fill="none" stroke="#EF3340" strokeWidth={13} strokeLinecap="round" />
          <Circle cx="92" cy="-74" r="16" fill="#EF3340" stroke="#C62828" strokeWidth={4.5} />

          {/* Corps */}
          <Path
            d="M 0,-88 C 46,-73 59,-24 59,28 Q 59,80 0,80 Q -59,80 -59,28 C -59,-24 -46,-73 0,-88 Z"
            fill="url(#bodyGradH)"
            stroke="#C62828"
            strokeWidth={5}
          />

          {/* Pieds */}
          <Ellipse cx="-31" cy="88" rx="23" ry="11" fill="#C62828" transform="rotate(-24,-31,88)" />
          <Ellipse cx="31"  cy="88" rx="23" ry="11" fill="#C62828" transform="rotate(24,31,88)" />

          {/* Yeux */}
          <Circle cx="-21" cy="-23" r="23" fill="white" />
          <Circle cx="21"  cy="-23" r="23" fill="white" />
          <Circle cx="-17" cy="-21" r="11" fill="#1A1A2E" />
          <Circle cx="26"  cy="-21" r="11" fill="#1A1A2E" />
          <Circle cx="-9"  cy="-29" r="5.5" fill="white" />
          <Circle cx="34"  cy="-29" r="5.5" fill="white" />

          {/* Joues */}
          <Ellipse cx="-45" cy="-8" rx="13" ry="9" fill="#EF9A9A" opacity={0.55} />
          <Ellipse cx="45"  cy="-8" rx="13" ry="9" fill="#EF9A9A" opacity={0.55} />

          {/* Bouche ouverte (content) */}
          <Path d="M -25,8 Q 0,38 25,8"  fill="#B71C1C" stroke="#B71C1C" strokeWidth={2} strokeLinecap="round" />
          <Path d="M -25,8 Q 0,25 25,8"  fill="white" />

          {/* Sourcils heureux (arqués vers le haut) */}
          <Path d="M -34,-50 Q -19,-63 -5,-52" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
          <Path d="M 5,-52 Q 19,-63 34,-50"    fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
        </G>
      </Svg>
    </Animated.View>
  );
}
