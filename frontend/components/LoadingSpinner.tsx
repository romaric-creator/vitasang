import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { color } from '@/constant/color';
import { ModernSpinner } from '@/components/ModernSpinner';

interface LoadingSpinnerProps {
  visible?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner = ({
  visible = true,
  size = 'large',
  color: spinnerColor = color.primary,
}: LoadingSpinnerProps) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <ModernSpinner size={size === 'small' ? 'small' : 'medium'} color={spinnerColor} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  spinnerContainer: {
    backgroundColor: color.surface,
    borderRadius: 12,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    minHeight: 100,
  },
});
