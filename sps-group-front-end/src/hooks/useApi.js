import { useState, useCallback } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, onSuccess) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro na operação';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError };
}
