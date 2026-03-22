import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// Mocks
jest.mock('../../components/TabBarIcon', () => ({
  TabBarIcon: 'TabBarIcon'
}));

// Mock ModernSpinner pour simplifier le test de LoadingSpinner
jest.mock('../../components/ModernSpinner', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ModernSpinner: ({ size, color }: any) => (
      <View testID="activity-indicator" style={{ width: size === 'small' ? 24 : 48, borderColor: color }} />
    )
  };
});

describe('ErrorAlert Component Tests', () => {
  it('should not render when visible is false', () => {
    const { queryByTestId } = render(
      <ErrorAlert
        visible={false}
        title="Error"
        message="Something went wrong"
        onDismiss={jest.fn()}
      />
    );

    expect(queryByTestId('error-alert-container')).toBeNull();
  });

  it('should render when visible is true', () => {
    const { getByTestId } = render(
      <ErrorAlert
        visible={true}
        title="Error"
        message="Something went wrong"
        onDismiss={jest.fn()}
      />
    );

    expect(getByTestId('error-alert-container')).toBeTruthy();
  });

  it('should display title and message', () => {
    const { getByText } = render(
      <ErrorAlert
        visible={true}
        title="Test Error"
        message="Test error message"
        onDismiss={jest.fn()}
      />
    );

    expect(getByText('Test Error')).toBeTruthy();
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('should call onDismiss when dismiss button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <ErrorAlert
        visible={true}
        title="Error"
        message="Something went wrong"
        onDismiss={onDismiss}
      />
    );

    fireEvent.press(getByText('common.errors.ok'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should call onRetry when retry button is present and pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorAlert
        visible={true}
        title="Error"
        message="Something went wrong"
        onDismiss={jest.fn()}
        onRetry={onRetry}
      />
    );

    fireEvent.press(getByText('common.errors.retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('LoadingSpinner Component Tests', () => {
  it('should not render when visible is false', () => {
    const { queryByTestId } = render(
      <LoadingSpinner visible={false} />
    );

    expect(queryByTestId('loading-spinner-container')).toBeNull();
  });

  it('should render when visible is true', () => {
    const { getByTestId } = render(
      <LoadingSpinner visible={true} />
    );

    expect(getByTestId('loading-spinner-container')).toBeTruthy();
  });

  it('should pass correct size to spinner', () => {
    const { getByTestId } = render(
      <LoadingSpinner visible={true} size="small" />
    );

    const spinner = getByTestId('activity-indicator');
    // Le mock définit la width à 24 pour 'small'
    expect(spinner.props.style).toEqual(expect.objectContaining({ width: 24 }));
  });

  it('should pass correct color to spinner', () => {
    const customColor = '#FF5733';
    const { getByTestId } = render(
      <LoadingSpinner visible={true} color={customColor} />
    );

    const spinner = getByTestId('activity-indicator');
    expect(spinner.props.style).toEqual(expect.objectContaining({ borderColor: customColor }));
  });
});
