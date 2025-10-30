import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attemptNumber: number) => void;
}

interface UseRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
  reset: () => void;
}

export function useRetry<T>({
  maxRetries = 3,
  retryDelay = 1000,
  onRetry,
}: UseRetryOptions = {}): UseRetryReturn<T> {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            setIsRetrying(true);
            setRetryCount(attempt);
            onRetry?.(attempt);
            
            // Exponential backoff
            const delay = retryDelay * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          const result = await fn();
          reset();
          return result;
        } catch (error) {
          lastError = error as Error;
          
          if (attempt === maxRetries) {
            reset();
            throw lastError;
          }
        }
      }

      // This should never happen, but TypeScript needs it
      throw lastError || new Error('Retry failed');
    },
    [maxRetries, retryDelay, onRetry, reset]
  );

  return {
    execute,
    isRetrying,
    retryCount,
    reset,
  };
}
