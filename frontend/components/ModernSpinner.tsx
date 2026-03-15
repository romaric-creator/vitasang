import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, ViewStyle } from 'react-native';
import { color } from '@/constant/color';

import SanguNeutral from './SanguNeutral';
import SanguHappy   from './SanguHappy';
import SanguHero    from './SanguHero';

interface ModernSpinnerProps {
  size?:    'small' | 'medium' | 'large';
  color?:   string;
  message?: string;
  style?:   ViewStyle;
  mascot?:  string;
  pose?:    'waving' | 'jumping' | 'superhero';
}

export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size         = 'medium',
  color: spinnerColor = color.primary,
  message,
  style,
  mascot = '🩸',
  pose   = 'waving',
}) => {
  const bounce  = useRef(new Animated.Value(0)).current;
  const tilt    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // --- Mascot : bounce vertical ---
    const bounceAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
    );

    // --- Mascot : oscillation latérale propre ---
    const tiltAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, {
          toValue: 1,
          duration: 960,
          useNativeDriver: true,
        }),
        Animated.timing(tilt, {
          toValue: -1,
          duration: 960,
          useNativeDriver: true,
        }),
      ]),
    );

    bounceAnim.start();
    tiltAnim.start();

    return () => {
      bounceAnim.stop();
      tiltAnim.stop();
    };
  }, [bounce, tilt]);

  const rotation = tilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-7deg', '0deg', '7deg'],
  });

  const sizeMap: Record<string, number> = { small: 72, medium: 110, large: 150 };
  const mascSize = sizeMap[size];

  const renderMascot = () => {
    if (pose === 'waving')    return <SanguNeutral width={mascSize} height={mascSize} animated />;
    if (pose === 'jumping')   return <SanguHappy   width={mascSize} height={mascSize} animated />;
    if (pose === 'superhero') return <SanguHero    width={mascSize} height={mascSize} animated />;
    return (
      <Text style={{ fontSize: mascSize * 0.6, textAlign: 'center' }}>
        {mascot}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>

      {/* Mascot — sans fond circulaire, juste l'ombre douce */}
      <Animated.View
        style={[
          styles.mascotWrapper,
          {
            width:  mascSize,
            height: mascSize,
            transform: [
              { translateY: bounce },
              { rotate: rotation },
            ],
          },
        ]}
      >
        {renderMascot()}
      </Animated.View>

      {/* Message optionnel */}
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  mascotWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    // Ombre légère sous le mascot — pas de fond coloré
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },

  message: {
    fontSize: 13,
    fontWeight: '500',
    color: color.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});


