import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useApiCall } from '../../hooks/useApiCall';

// Augmenter le timeout pour les tests async
jest.setTimeout(10000);

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
        .mockResolvedValue({ data: 'success on 3rd attempt' })
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Hook Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useApiCall(mockService.success, {}));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should execute API call successfully', async () => {
      const { result } = renderHook(() => useApiCall(mockService.success, {}));

      await act(async () => {
        const promise = result.current.execute();
        await promise;
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockService.success).toHaveBeenCalled();
    });

    it('should set loading state during execution', async () => {
      const { result } = renderHook(() => useApiCall(mockService.slowResponse, {}));

      let executionPromise: Promise<any>;
      
      await act(async () => {
        executionPromise = result.current.execute();
      });

      // Vérifier loading immédiat
      expect(result.current.loading).toBe(true);

      // Avancer le temps pour résoudre la promesse
      await act(async () => {
        jest.advanceTimersByTime(100);
        await executionPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const { result } = renderHook(() => useApiCall(mockService.failure, {}));

      await act(async () => {
        try {
          await result.current.execute();
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();
    });

    it('should retry on failure', async () => {
      // Note: On mock le logger pour éviter de polluer la console pendant ce test
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const { result } = renderHook(() => useApiCall(mockService.intermittentFailure, { maxRetries: 3 }));

      let promise: Promise<any>;
      await act(async () => {
        promise = result.current.execute();
      });

      // Tentative 1 échoue -> Attente 1000ms
      await act(async () => {
        jest.advanceTimersByTime(1000); 
      });

      // Tentative 2 échoue -> Attente 2000ms
      await act(async () => {
        jest.advanceTimersByTime(2000); 
      });
      
      // Tentative 3 réussit
      await act(async () => {
        try {
          await promise;
        } catch (e) {
          // Should not throw eventually
        }
      });

      expect(mockService.intermittentFailure).toHaveBeenCalledTimes(3);
      consoleSpy.mockRestore();
    });

    it('should reset error state', async () => {
      const { result } = renderHook(() => useApiCall(mockService.failure, {}));

      await act(async () => {
        try {
          await result.current.execute();
        } catch (e) {}
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
      const { result } = renderHook(() => useApiCall(mockService.success, { onSuccess }));

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledWith({ data: 'success' });
    });

    it('should call onError callback', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useApiCall(mockService.failure, { onError }));

      await act(async () => {
        try {
          await result.current.execute();
        } catch (e) {}
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout after configured time', async () => {
      // Une promesse qui ne se résout jamais (simulée)
      const neverResolves = jest.fn().mockImplementation(() => new Promise(() => {}));
      
      const { result } = renderHook(() => useApiCall(neverResolves, { timeout: 1000 }));

      const promise = act(async () => {
        try {
           const exec = result.current.execute();
           jest.advanceTimersByTime(1000); // Déclenche le timeout
           await exec;
        } catch (e) {
          // Expected timeout error
        }
      });
      
      await promise;

      expect(result.current.error).not.toBeNull();
      // Le message d'erreur peut varier selon l'implémentation, on vérifie juste qu'il y a une erreur
    });
  });
});
