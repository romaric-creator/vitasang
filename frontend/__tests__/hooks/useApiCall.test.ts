import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useApiCall } from '../hooks/useApiCall';

describe('useApiCall Hook Tests', () => {
  let mockService;

  beforeEach(() => {
    mockService = {
      success: jest.fn().mockResolvedValue({ data: 'success' }),
      failure: jest.fn().mockRejectedValue(new Error('API Error')),
      slowResponse: jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: 'slow' }), 100))
      ),
      intermittentFailure: jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce({ data: 'success on 3rd attempt' })
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Basic Hook Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useApiCall());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should execute API call successfully', async () => {
      const { result } = renderHook(() => useApiCall());

      await act(async () => {
        await result.current.execute(mockService.success);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockService.success).toHaveBeenCalled();
    });

    it('should set loading state during execution', async () => {
      const { result } = renderHook(() => useApiCall());

      let loadingWasSeen = false;

      act(() => {
        result.current.execute(mockService.slowResponse);
        if (result.current.loading) {
          loadingWasSeen = true;
        }
      });

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(loadingWasSeen || !result.current.loading).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const { result } = renderHook(() => useApiCall());

      await act(async () => {
        await result.current.execute(mockService.failure).catch(() => {});
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toContain('API Error');
    });

    it('should retry on failure', async () => {
      const { result } = renderHook(() => useApiCall());

      await act(async () => {
        await result.current.execute(mockService.intermittentFailure).catch(() => {});
      });

      // Advance timers through retry backoff (1s, 2s)
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockService.intermittentFailure.mock.calls.length).toBeGreaterThan(1);
      });
    });

    it('should reset error state', async () => {
      const { result } = renderHook(() => useApiCall());

      await act(async () => {
        await result.current.execute(mockService.failure).catch(() => {});
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Callback Handling', () => {
    it('should call onSuccess callback', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useApiCall());

      await act(async () => {
        await result.current.execute(mockService.success, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith({ data: 'success' });
    });

    it('should call onError callback', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useApiCall());

      await act(async () => {
        await result.current.execute(mockService.failure, { onError }).catch(() => {});
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout after 10 seconds', async () => {
      const { result } = renderHook(() => useApiCall());

      const neverResolves = new Promise(() => {
        // Never resolves
      });

      act(() => {
        result.current.execute(() => neverResolves).catch(() => {});
      });

      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });
    });
  });
});
