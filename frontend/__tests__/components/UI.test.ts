import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';

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

    fireEvent.press(getByText('OK'));
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

    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should display correct styling for error type', () => {
    const { getByTestId } = render(
      <ErrorAlert
        visible={true}
        title="Error"
        message="Error message"
        type="error"
        onDismiss={jest.fn()}
      />
    );

    const container = getByTestId('error-alert-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#FF6B6B' // Error color (red)
      })
    );
  });

  it('should display correct styling for warning type', () => {
    const { getByTestId } = render(
      <ErrorAlert
        visible={true}
        title="Warning"
        message="Warning message"
        type="warning"
        onDismiss={jest.fn()}
      />
    );

    const container = getByTestId('error-alert-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#FFA500' // Warning color (amber)
      })
    );
  });

  it('should display correct styling for info type', () => {
    const { getByTestId } = render(
      <ErrorAlert
        visible={true}
        title="Info"
        message="Info message"
        type="info"
        onDismiss={jest.fn()}
      />
    );

    const container = getByTestId('error-alert-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#00CED1' // Info color (cyan)
      })
    );
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

  it('should have semi-transparent background', () => {
    const { getByTestId } = render(
      <LoadingSpinner visible={true} />
    );

    const container = getByTestId('loading-spinner-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      })
    );
  });

  it('should render with small size', () => {
    const { getByTestId } = render(
      <LoadingSpinner visible={true} size="small" />
    );

    const spinner = getByTestId('activity-indicator');
    expect(spinner.props.size).toBe('small');
  });

  it('should render with large size', () => {
    const { getByTestId } = render(
      <LoadingSpinner visible={true} size="large" />
    );

    const spinner = getByTestId('activity-indicator');
    expect(spinner.props.size).toBe('large');
  });

  it('should render with custom color', () => {
    const customColor = '#FF5733';
    const { getByTestId } = render(
      <LoadingSpinner visible={true} color={customColor} />
    );

    const spinner = getByTestId('activity-indicator');
    expect(spinner.props.color).toBe(customColor);
  });

  it('should use default color if not provided', () => {
    const { getByTestId } = render(
      <LoadingSpinner visible={true} />
    );

    const spinner = getByTestId('activity-indicator');
    expect(spinner.props.color).toBe('#007AFF'); // Default iOS blue
  });

  it('should center spinner on screen', () => {
    const { getByTestId } = render(
      <LoadingSpinner visible={true} />
    );

    const spinner = getByTestId('activity-indicator');
    expect(spinner.props.style).toContainEqual(
      expect.objectContaining({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      })
    );
  });
});
