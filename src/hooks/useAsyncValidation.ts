// src/hooks/useAsyncValidation.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncValidationOptions<T> {
  value: T;
  validationFn: (value: T) => Promise<{ isValid: boolean; message?: string }>;
  debounceMs?: number;
  validateOnMount?: boolean;
  skip?: boolean;
}

interface UseAsyncValidationReturn {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  validate: () => Promise<void>;
}

export function useAsyncValidation<T>({
  value,
  validationFn,
  debounceMs = 500,
  validateOnMount = false,
  skip = false,
}: UseAsyncValidationOptions<T>): UseAsyncValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const validate = useCallback(async () => {
    if (skip) {
      setIsValid(null);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsValidating(true);
    setError(null);

    try {
      const result = await validationFn(value);
      
      if (!abortControllerRef.current.signal.aborted) {
        setIsValid(result.isValid);
        setError(result.message || null);
      }
    } catch {
      if (!abortControllerRef.current.signal.aborted) {
        setIsValid(false);
        setError('Error al validar. Intenta de nuevo.');
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsValidating(false);
      }
    }
  }, [value, validationFn, skip]);

  useEffect(() => {
    if (validateOnMount && !skip) {
      validate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (skip) {
      setIsValid(null);
      setError(null);
      setIsValidating(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsValid(null);
    setError(null);

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      setIsValidating(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      validate();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [value, validate, debounceMs, skip]);

  return {
    isValidating,
    isValid,
    error,
    validate,
  };
}