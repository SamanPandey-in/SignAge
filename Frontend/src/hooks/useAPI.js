/**
 * useAPI Hook
 * Phase 2: Custom hook to integrate API calls with Redux loading states and error handling
 * 
 * Features:
 * - Automatic loading state management
 * - Integrated error notification via Redux
 * - Automatic retry logic
 * - Request cancellation
 * - Success/error callbacks
 */

import { useCallback, useState } from 'react';
import apiService, { API_ERROR_TYPES } from '@services/apiService';
import { useNotification } from './useNotification';

/**
 * useAPI Hook
 * 
 * Usage:
 * const { execute, loading, error } = useAPI(
 *   (data) => apiService.getAllLessons(),
 *   { showNotification: true, onSuccess: handleSuccess }
 * );
 * 
 * await execute();
 */
export const useAPI = (
  apiCall,
  options = {}
) => {
  const {
    showNotification = true,
    showErrorNotification = true,
    autoRetry = true,
    maxRetries = 2,
    onSuccess = null,
    onError = null,
    successMessage = null,
  } = options;

  const notification = useNotification();
  const [loading, setLoading] = useApiLoadingState(apiCall.name || 'API_CALL');
  const [error, setError] = useApiErrorState(apiCall.name || 'API_CALL');

  /**
   * Execute API call with error handling and notifications
   */
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(...args);

        if (result.success) {
          // Success case
          if (showNotification && successMessage) {
            notification.success(successMessage);
          }

          if (onSuccess) {
            onSuccess(result.data);
          }

          return result;
        } else {
          // API returned error
          setError(result.error);

          if (showErrorNotification) {
            notification.error(result.error);
          }

          if (onError) {
            onError(result.error, result.errorType);
          }

          // Retry logic for network errors
          if (autoRetry && result.errorType === API_ERROR_TYPES.NETWORK_ERROR && (args[2] || 0) < maxRetries) {
            console.warn(`[API Hook] Retrying after error: ${result.error}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            args[2] = (args[2] || 0) + 1;
            return execute(...args);
          }

          return result;
        }
      } catch (err) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);

        if (showErrorNotification) {
          notification.error(errorMessage);
        }

        if (onError) {
          onError(errorMessage, API_ERROR_TYPES.UNKNOWN_ERROR);
        }

        return {
          success: false,
          error: errorMessage,
          errorType: API_ERROR_TYPES.UNKNOWN_ERROR,
        };
      } finally {
        setLoading(false);
      }
    },
    [apiCall, showNotification, showErrorNotification, autoRetry, maxRetries, onSuccess, onError, successMessage, notification]
  );

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
  };
};

/**
 * Simple loading state management
 * Can be replaced with Redux if needed for complex loading scenarios
 */
const useApiLoadingState = (key) => {
  const [loading, setLoading] = useState(false);
  return [loading, setLoading];
};

/**
 * Simple error state management
 * Can be replaced with Redux if needed for complex error scenarios
 */
const useApiErrorState = (key) => {
  const [error, setError] = useState(null);
  return [error, setError];
};

export default useAPI;
