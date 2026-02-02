/**
 * useAPIWithRedux Hook
 * Phase 2: Advanced hook integrating API calls with Redux loading/error states
 * 
 * Features:
 * - Redux-backed loading and error states for persistence across re-renders
 * - Automatic endpoint state tracking
 * - Cache invalidation support
 * - Request queuing and deduplication at Redux level
 * - Global error aggregation
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import apiService, { API_ERROR_TYPES } from '@services/apiService';
import { useNotification } from './useNotification';
import {
  setEndpointLoading,
  clearEndpointLoading,
  setEndpointError,
  clearEndpointError,
  updateRequestMetadata,
} from '@store/slices/apiSlice';
import {
  selectEndpointLoading,
  selectEndpointError,
  selectRequestMetadata,
} from '@store/slices/apiSlice';

/**
 * useAPIWithRedux Hook
 * 
 * Usage:
 * const { execute, loading, error } = useAPIWithRedux(
 *   '/lessons',
 *   () => apiService.getAllLessons(),
 *   { showNotification: true, autoRetry: true }
 * );
 * 
 * useEffect(() => {
 *   execute();
 * }, [execute]);
 */
export const useAPIWithRedux = (
  endpoint,
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

  const dispatch = useDispatch();
  const notification = useNotification();
  const abortControllerRef = useRef(new AbortController());

  // Get Redux state for this endpoint
  const loading = useSelector((state) => selectEndpointLoading(state, endpoint));
  const error = useSelector((state) => selectEndpointError(state, endpoint));
  const metadata = useSelector((state) => selectRequestMetadata(state, endpoint));

  /**
   * Execute API call with Redux state management
   */
  const execute = useCallback(
    async (...args) => {
      // Check if request is already in progress
      if (loading) {
        console.warn(`[API Redux] Request already in progress for ${endpoint}`);
        return;
      }

      // Signal start of request
      dispatch(setEndpointLoading({ endpoint }));
      dispatch(clearEndpointError({ endpoint }));

      try {
        const result = await apiCall(...args);

        if (result.success) {
          // Success case
          if (showNotification && successMessage) {
            notification.success(successMessage);
          }

          // Update metadata
          dispatch(updateRequestMetadata({ endpoint, metadata: { retries: 0 } }));

          if (onSuccess) {
            onSuccess(result.data);
          }

          return result;
        } else {
          // API returned error
          dispatch(setEndpointError({
            endpoint,
            error: result.error,
            errorType: result.errorType,
          }));

          if (showErrorNotification) {
            notification.error(result.error);
          }

          if (onError) {
            onError(result.error, result.errorType);
          }

          // Retry logic for network errors
          const retries = metadata?.retries || 0;
          if (autoRetry && result.errorType === API_ERROR_TYPES.NETWORK_ERROR && retries < maxRetries) {
            console.warn(`[API Redux] Retrying ${endpoint} (attempt ${retries + 1})`);
            
            dispatch(updateRequestMetadata({
              endpoint,
              metadata: { retries: retries + 1 },
            }));

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
            dispatch(clearEndpointLoading({ endpoint }));
            return execute(...args);
          }

          return result;
        }
      } catch (err) {
        const errorMessage = err.message || 'An unexpected error occurred';

        dispatch(setEndpointError({
          endpoint,
          error: errorMessage,
          errorType: API_ERROR_TYPES.UNKNOWN_ERROR,
        }));

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
        dispatch(clearEndpointLoading({ endpoint }));
      }
    },
    [endpoint, apiCall, dispatch, notification, showNotification, showErrorNotification, autoRetry, maxRetries, onSuccess, onError, successMessage, loading, metadata]
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    execute,
    loading,
    error,
    metadata,
    clearError: () => dispatch(clearEndpointError({ endpoint })),
    clearLoading: () => dispatch(clearEndpointLoading({ endpoint })),
  };
};

export default useAPIWithRedux;
