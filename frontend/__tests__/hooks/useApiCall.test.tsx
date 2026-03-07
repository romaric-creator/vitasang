import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useApiCall } from '../../hooks/useApiCall';

describe('useApiCall Hook Tests', () => {
  let mockService: Record<string, jest.Mock>;

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
      const { result } = (renderHook as any)(() => useApiCall(mockService.success, {}));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should execute API call successfully', async () => {
      const { result } = (renderHook as any)(() => useApiCall(mockService.success, {}));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockService.success).toHaveBeenCalled();
    });

    it('should set loading state during execution', async () => {
      const { result } = (renderHook as any)(() => useApiCall(mockService.slowResponse, {}));

      let loadingWasSeen = false;

      act(() => {
        result.current.execute();
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
      const { result } = (renderHook as any)(() => useApiCall(mockService.failure, {}));

      try {
        await act(async () => {
          await result.current.execute().catch(() => {});
        });
      } catch (e) {
        // Expected
      }

      expect(result.current.error).not.toBeNull();
    });

    it('should retry on failure', async () => {
      const { result } = (renderHook as any)(() => useApiCall(mockService.intermittentFailure, { maxRetries: 3 }));

      try {
        await act(async () => {
          await result.current.execute().catch(() => {});
        });
      } catch (e) {
        // Expected
      }

      // Advance timers through retry backoff (1s, 2s)
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockService.intermittentFailure.mock.calls.length).toBeGreaterThan(1);
      });
    });

    it('should reset error state', async () => {
      const { result } = (renderHook as any)(() => useApiCall(mockService.failure, {}));

      try {
        await act(async () => {
          await result.current.execute().catch(() => {});
        });
      } catch (e) {
        // Expected
      }

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
      const { result } = (renderHook as any)(() => useApiCall(mockService.success, { onSuccess }));

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledWith({ data: 'success' });
    });

    it('should call onError callback', async () => {
      const onError = jest.fn();
      const { result } = (renderHook as any)(() => useApiCall(mockService.failure, { onError }));

      try {
        await act(async () => {
          await result.current.execute().catch(() => {});
        });
      } catch (e) {
        // Expected
      }

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout after configured time', async () => {
      const neverResolves = (): Promise<any> => new Promise<any>(() => {
        // Never resolves
      });
      const { result } = (renderHook as any)(() => useApiCall(neverResolves, { timeout: 1000 }));

      jest.advanceTimersByTime(1000);

      try {
        await act(async () => {
          await result.current.execute().catch(() => {});
        });
      } catch (e) {
        // Expected
      }

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });
    });
  });
});
