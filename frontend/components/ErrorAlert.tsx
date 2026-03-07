import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { color } from '@/constant/color';
import { TabBarIcon } from './TabBarIcon';

interface ErrorAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorAlert = ({
  visible,
  title = 'Erreur',
  message,
  onDismiss,
  onRetry,
  type = 'error',
}: ErrorAlertProps) => {
  if (!visible) {
    return null;
  }

  const backgroundColor =
    type === 'error'
      ? '#FFE5E5'
      : type === 'warning'
      ? '#FFF3CD'
      : '#D1ECF1';

  const borderColor =
    type === 'error'
      ? '#F5222D'
      : type === 'warning'
      ? '#FAAD14'
      : '#17A2B8';

  const iconColor =
    type === 'error'
      ? '#F5222D'
      : type === 'warning'
      ? '#FAAD14'
      : '#17A2B8';

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <TabBarIcon 
          name={type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} 
          color={iconColor}
          size={18}
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={onRetry}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.dismissButton]}
          onPress={onDismiss}
        >
          <Text style={styles.dismissText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  message: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  retryButton: {
    backgroundColor: color.primary,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dismissText: {
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
});
