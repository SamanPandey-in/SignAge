/**
 * API State Slice
 * Phase 2: Redux slice for managing API request states across the app
 * 
 * Tracks:
 * - Global loading state for multiple concurrent requests
 * - API errors with categorization
 * - Request metadata (timestamps, retry counts)
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Track loading state for specific API endpoints
  loadingEndpoints: {}, // { '/lessons': true, '/progress': false }
  
  // Global loading flag (true if any request is in progress)
  isLoading: false,
  
  // Current API errors
  errors: {}, // { '/lessons': { message: '...', type: 'NETWORK_ERROR', timestamp: '...' } }
  
  // Request metadata
  requestMetadata: {}, // { '/lessons': { retries: 1, lastAttempt: '...' } }
  
  // Cache info
  cacheMetadata: {}, // { '/lessons': { timestamp: '...', ttl: 300000 } }
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    /**
     * Mark an endpoint as loading
     */
    setEndpointLoading(state, action) {
      const { endpoint } = action.payload;
      state.loadingEndpoints[endpoint] = true;
      state.isLoading = Object.values(state.loadingEndpoints).some(v => v);
    },

    /**
     * Mark an endpoint as finished loading
     */
    clearEndpointLoading(state, action) {
      const { endpoint } = action.payload;
      state.loadingEndpoints[endpoint] = false;
      state.isLoading = Object.values(state.loadingEndpoints).some(v => v);
    },

    /**
     * Set error for an endpoint
     */
    setEndpointError(state, action) {
      const { endpoint, error, errorType } = action.payload;
      state.errors[endpoint] = {
        message: error,
        type: errorType,
        timestamp: new Date().toISOString(),
      };
    },

    /**
     * Clear error for an endpoint
     */
    clearEndpointError(state, action) {
      const { endpoint } = action.payload;
      delete state.errors[endpoint];
    },

    /**
     * Clear all errors
     */
    clearAllErrors(state) {
      state.errors = {};
    },

    /**
     * Update request metadata (retry count, last attempt)
     */
    updateRequestMetadata(state, action) {
      const { endpoint, metadata } = action.payload;
      state.requestMetadata[endpoint] = {
        ...state.requestMetadata[endpoint],
        ...metadata,
        lastAttempt: new Date().toISOString(),
      };
    },

    /**
     * Set cache metadata for endpoint
     */
    setCacheMetadata(state, action) {
      const { endpoint, ttl } = action.payload;
      state.cacheMetadata[endpoint] = {
        timestamp: new Date().getTime(),
        ttl,
      };
    },

    /**
     * Check if cache is still valid
     */
    isCacheValid(state, action) {
      const { endpoint } = action.payload;
      const cache = state.cacheMetadata[endpoint];
      if (!cache) return false;

      const now = new Date().getTime();
      const age = now - cache.timestamp;
      return age < cache.ttl;
    },

    /**
     * Reset entire API state
     */
    resetApiState() {
      return initialState;
    },
  },

  selectors: {
    /**
     * Get loading state for specific endpoint
     */
    selectEndpointLoading: (state, endpoint) => state.loadingEndpoints[endpoint] || false,

    /**
     * Get global loading state
     */
    selectIsLoading: (state) => state.isLoading,

    /**
     * Get error for specific endpoint
     */
    selectEndpointError: (state, endpoint) => state.errors[endpoint] || null,

    /**
     * Get all current errors
     */
    selectAllErrors: (state) => state.errors,

    /**
     * Get request metadata
     */
    selectRequestMetadata: (state, endpoint) => state.requestMetadata[endpoint] || null,

    /**
     * Get cache metadata
     */
    selectCacheMetadata: (state, endpoint) => state.cacheMetadata[endpoint] || null,
  },
});

export const {
  setEndpointLoading,
  clearEndpointLoading,
  setEndpointError,
  clearEndpointError,
  clearAllErrors,
  updateRequestMetadata,
  setCacheMetadata,
  isCacheValid,
  resetApiState,
} = apiSlice.actions;

export const {
  selectEndpointLoading,
  selectIsLoading,
  selectEndpointError,
  selectAllErrors,
  selectRequestMetadata,
  selectCacheMetadata,
} = apiSlice.selectors;

export default apiSlice.reducer;
