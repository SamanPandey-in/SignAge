/**
 * Phase 2 API Layer Exports
 * 
 * This file exports all Phase 2 components for easy importing:
 * 
 * import { apiService, useAPI, useAPIWithRedux, API_ERROR_TYPES } from '@phase2';
 */

export { default as apiService, API_ERROR_TYPES } from '@services/apiService';
export { useAPI } from '@hooks/useAPI';
export { useAPIWithRedux } from '@hooks/useAPIWithRedux';

export {
  setEndpointLoading,
  clearEndpointLoading,
  setEndpointError,
  clearEndpointError,
  clearAllErrors,
  updateRequestMetadata,
  setCacheMetadata,
  isCacheValid,
  resetApiState,
} from '@store/slices/apiSlice';

export {
  selectEndpointLoading,
  selectIsLoading,
  selectEndpointError,
  selectAllErrors,
  selectRequestMetadata,
  selectCacheMetadata,
} from '@store/slices/apiSlice';
