import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { color } from '@/constant/color';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryInternalProps extends ErrorBoundaryProps {
  t: (key: string) => string;
}

class ErrorBoundaryInternal extends React.Component<ErrorBoundaryInternalProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryInternalProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>⚠️</Text>
              </View>
            </View>

            <Text style={styles.errorTitle}>{t('common.errors.oops')}</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || t('common.errors.unexpected')}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={this.resetError}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t('common.errors.retry')}</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>VitaSang Safety Shield</Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const { t } = useTranslation();
  return <ErrorBoundaryInternal t={t}>{children}</ErrorBoundaryInternal>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', // light slate background
    padding: 24,
  },
  errorCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: color.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footerText: {
    marginTop: 24,
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
