/**
 * useCachedAPI Hook
 * Phase 3: Combine API calls with caching
 * 
 * Features:
 * - Automatic cache check before API call
 * - Cache invalidation on mutations
 * - TTL-aware caching
 * - Redux integration with cache state
 * - Pattern-based cache invalidation
 */

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cacheService from '@services/cacheService';
import apiService from '@services/apiService';
import {
  setCacheEntry,
  invalidateCacheEntry,
  invalidateCachePattern,
  selectCacheEntry,
  selectCacheIsValid,
} from '@store/slices/cacheSlice';

/**
 * Hook for cached API calls with automatic TTL validation
 */
export const useCachedAPI = (
  cacheKey,
  fetcher,
  options = {}
) => {
  const {
    namespace = 'default',
    ttl = null,
    autoFetch = true,
    onSuccess = null,
    onError = null,
    dependencies = [],
    cacheStrategy = 'cache-first', // 'cache-first', 'network-first', 'cache-only', 'network-only'
  } = options;

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [source, setSource] = useState(null); // 'cache' or 'api'
  const cacheEntry = useSelector(state => selectCacheEntry(state, `${namespace}:${cacheKey}`));
  const isCacheValid = useSelector(state => selectCacheIsValid(state, `${namespace}:${cacheKey}`));

  /**
   * Execute fetch with cache strategy
   */
  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result = null;

      if (cacheStrategy === 'cache-first') {
        // Try cache first
        const cached = cacheService.get(cacheKey, namespace);
        if (cached !== null && isCacheValid) {
          setData(cached);
          setSource('cache');
          dispatch(setCacheEntry({
            endpoint: `${namespace}:${cacheKey}`,
            isValid: true,
            ttl: cacheEntry?.ttl,
            size: JSON.stringify(cached).length,
          }));
          if (onSuccess) onSuccess(cached, 'cache');
          setLoading(false);
          return cached;
        }

        // Fetch from API
        result = await fetcher();
        if (result?.success || result?.data) {
          const responseData = result?.data || result;
          cacheService.set(cacheKey, responseData, namespace, ttl);
          setData(responseData);
          setSource('api');
          dispatch(setCacheEntry({
            endpoint: `${namespace}:${cacheKey}`,
            isValid: true,
            ttl: ttl || 300000,
            size: JSON.stringify(responseData).length,
          }));
          if (onSuccess) onSuccess(responseData, 'api');
          setLoading(false);
          return responseData;
        } else {
          throw new Error(result?.error || 'Unknown error');
        }
      } else if (cacheStrategy === 'network-first') {
        // Try network first
        try {
          result = await fetcher();
          if (result?.success || result?.data) {
            const responseData = result?.data || result;
            cacheService.set(cacheKey, responseData, namespace, ttl);
            setData(responseData);
            setSource('api');
            dispatch(setCacheEntry({
              endpoint: `${namespace}:${cacheKey}`,
              isValid: true,
              ttl: ttl || 300000,
              size: JSON.stringify(responseData).length,
            }));
            if (onSuccess) onSuccess(responseData, 'api');
            setLoading(false);
            return responseData;
          }
        } catch (apiError) {
          // Fall back to cache
          const cached = cacheService.get(cacheKey, namespace);
          if (cached !== null) {
            setData(cached);
            setSource('cache');
            if (onSuccess) onSuccess(cached, 'cache');
            setLoading(false);
            return cached;
          }
          throw apiError;
        }
      } else if (cacheStrategy === 'cache-only') {
        // Only use cache
        const cached = cacheService.get(cacheKey, namespace);
        if (cached !== null) {
          setData(cached);
          setSource('cache');
          if (onSuccess) onSuccess(cached, 'cache');
          setLoading(false);
          return cached;
        }
        throw new Error('Cache miss - no data available');
      } else if (cacheStrategy === 'network-only') {
        // Only use network
        result = await fetcher();
        if (result?.success || result?.data) {
          const responseData = result?.data || result;
          cacheService.set(cacheKey, responseData, namespace, ttl);
          setData(responseData);
          setSource('api');
          dispatch(setCacheEntry({
            endpoint: `${namespace}:${cacheKey}`,
            isValid: true,
            ttl: ttl || 300000,
            size: JSON.stringify(responseData).length,
          }));
          if (onSuccess) onSuccess(responseData, 'api');
          setLoading(false);
          return responseData;
        } else {
          throw new Error(result?.error || 'Unknown error');
        }
      }
    } catch (err) {
      console.error(`[useCachedAPI] Error fetching ${cacheKey}:`, err);
      setError(err.message);
      if (onError) onError(err);
      setLoading(false);
      throw err;
    }
  }, [cacheKey, namespace, fetcher, ttl, onSuccess, onError, dispatch, isCacheValid, cacheEntry]);

  /**
   * Auto-fetch on mount or dependency change
   */
  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [...dependencies, execute, autoFetch]);

  /**
   * Manually invalidate this cache entry
   */
  const invalidate = useCallback(() => {
    cacheService.invalidate(cacheKey, namespace);
    dispatch(invalidateCacheEntry({
      endpoint: `${namespace}:${cacheKey}`,
    }));
  }, [cacheKey, namespace, dispatch]);

  /**
   * Invalidate by pattern
   */
  const invalidatePattern = useCallback((pattern) => {
    cacheService.invalidatePattern(pattern, namespace);
    dispatch(invalidateCachePattern({
      pattern,
    }));
  }, [namespace, dispatch]);

  /**
   * Refetch with fresh data
   */
  const refetch = useCallback(async () => {
    invalidate();
    return execute();
  }, [invalidate, execute]);

  /**
   * Update cache with new data (optimistic update)
   */
  const updateCache = useCallback((newData) => {
    cacheService.set(cacheKey, newData, namespace, ttl);
    setData(newData);
    dispatch(setCacheEntry({
      endpoint: `${namespace}:${cacheKey}`,
      isValid: true,
      ttl: ttl || 300000,
      size: JSON.stringify(newData).length,
    }));
  }, [cacheKey, namespace, ttl, dispatch]);

  return {
    data,
    loading,
    error,
    source,
    cacheValid: isCacheValid,
    execute,
    invalidate,
    invalidatePattern,
    refetch,
    updateCache,
  };
};

/**
 * Hook for cached mutations (POST/PUT/DELETE) with cache invalidation
 */
export const useCachedMutation = (
  mutationFetcher,
  options = {}
) => {
  const {
    onSuccess = null,
    onError = null,
    invalidateKeys = [], // Cache keys to invalidate after mutation
    invalidatePatterns = [], // Patterns to invalidate after mutation
  } = options;

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute mutation and invalidate cache
   */
  const mutate = useCallback(async (input) => {
    try {
      setLoading(true);
      setError(null);

      const result = await mutationFetcher(input);

      if (result?.success || result?.data) {
        const responseData = result?.data || result;
        setData(responseData);

        // Invalidate specified cache keys
        for (const { key, namespace = 'default' } of invalidateKeys) {
          cacheService.invalidate(key, namespace);
          dispatch(invalidateCacheEntry({
            endpoint: `${namespace}:${key}`,
          }));
        }

        // Invalidate by patterns
        for (const { pattern, namespace = 'default' } of invalidatePatterns) {
          cacheService.invalidatePattern(pattern, namespace);
          dispatch(invalidateCachePattern({
            pattern,
          }));
        }

        if (onSuccess) onSuccess(responseData);
        setLoading(false);
        return responseData;
      } else {
        throw new Error(result?.error || 'Mutation failed');
      }
    } catch (err) {
      console.error('[useCachedMutation] Error:', err);
      setError(err.message);
      if (onError) onError(err);
      setLoading(false);
      throw err;
    }
  }, [mutationFetcher, invalidateKeys, invalidatePatterns, onSuccess, onError, dispatch]);

  /**
   * Reset mutation state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
};

export default useCachedAPI;
