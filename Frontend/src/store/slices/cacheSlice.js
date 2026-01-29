/**
 * Cache Slice
 * Phase 3: Redux state management for cache operations
 * 
 * Tracks:
 * - Cache validity status per endpoint
 * - Last update timestamps
 * - Cache size metrics
 * - Invalidation events
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Cache entry metadata { endpoint: { isValid, lastUpdate, ttl, size } }
  entries: {},

  // Global cache stats
  stats: {
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
    hits: 0,
    misses: 0,
  },

  // Warming state
  warming: {
    isActive: false,
    progress: 0,
    total: 0,
    warmedTasks: [],
    failedTasks: [],
    startTime: null,
    estimatedTimeRemaining: null,
  },

  // Invalidation queue for optimistic updates
  invalidationQueue: [],

  // Last global cache clear timestamp
  lastClearTime: null,
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,

  reducers: {
    /**
     * Set cache entry metadata
     */
    setCacheEntry: (state, action) => {
      const { endpoint, isValid, ttl, size } = action.payload;
      state.entries[endpoint] = {
        isValid,
        lastUpdate: Date.now(),
        ttl,
        size,
      };
    },

    /**
     * Mark cache entry as invalid
     */
    invalidateCacheEntry: (state, action) => {
      const { endpoint } = action.payload;
      if (state.entries[endpoint]) {
        state.entries[endpoint].isValid = false;
      }
      state.invalidationQueue.push({
        endpoint,
        timestamp: Date.now(),
      });
    },

    /**
     * Mark multiple cache entries as invalid by pattern
     */
    invalidateCachePattern: (state, action) => {
      const { pattern } = action.payload;
      const regex = new RegExp(pattern);

      for (const endpoint of Object.keys(state.entries)) {
        if (regex.test(endpoint)) {
          state.entries[endpoint].isValid = false;
          state.invalidationQueue.push({
            endpoint,
            timestamp: Date.now(),
          });
        }
      }
    },

    /**
     * Update cache statistics
     */
    updateCacheStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload,
        lastUpdate: Date.now(),
      };
    },

    /**
     * Start cache warming
     */
    startCacheWarming: (state, action) => {
      state.warming.isActive = true;
      state.warming.progress = 0;
      state.warming.startTime = Date.now();
      state.warming.warmedTasks = [];
      state.warming.failedTasks = [];
      state.warming.total = action.payload?.total || 0;
    },

    /**
     * Update cache warming progress
     */
    updateWarmingProgress: (state, action) => {
      const { completed, failed, total, currentPriority } = action.payload;
      state.warming.progress = completed + failed;
      state.warming.total = total;
      state.warming.currentPriority = currentPriority;

      if (state.warming.startTime) {
        const elapsed = Date.now() - state.warming.startTime;
        const rate = (completed + failed) / (elapsed / 1000); // items per second
        const remaining = total - (completed + failed);
        state.warming.estimatedTimeRemaining = Math.ceil(remaining / rate) * 1000; // ms
      }
    },

    /**
     * Complete cache warming
     */
    completeCacheWarming: (state, action) => {
      const { warmed, failed, total } = action.payload;
      state.warming.isActive = false;
      state.warming.warmedTasks = warmed;
      state.warming.failedTasks = failed;
      state.warming.progress = total;
      state.warming.completionTime = Date.now();
    },

    /**
     * Check if cache entry is valid
     */
    checkCacheValidity: (state, action) => {
      const { endpoint } = action.payload;
      const entry = state.entries[endpoint];

      if (!entry) return;

      // Check if TTL has expired
      if (entry.ttl && Date.now() - entry.lastUpdate > entry.ttl) {
        entry.isValid = false;
      }
    },

    /**
     * Clear all cache entries
     */
    clearAllCache: (state) => {
      state.entries = {};
      state.stats = initialState.stats;
      state.lastClearTime = Date.now();
      state.invalidationQueue = [];
    },

    /**
     * Clear cache for specific namespace
     */
    clearNamespaceCache: (state, action) => {
      const { namespace } = action.payload;
      const pattern = new RegExp(`^${namespace}:`);

      for (const endpoint of Object.keys(state.entries)) {
        if (pattern.test(endpoint)) {
          delete state.entries[endpoint];
        }
      }
    },

    /**
     * Reset warming state
     */
    resetWarmingState: (state) => {
      state.warming = initialState.warming;
    },

    /**
     * Batch update multiple cache entries
     */
    batchUpdateCacheEntries: (state, action) => {
      const { entries } = action.payload;
      for (const [endpoint, metadata] of Object.entries(entries)) {
        state.entries[endpoint] = {
          ...metadata,
          lastUpdate: Date.now(),
        };
      }
    },

    /**
     * Clear invalidation queue (after processing)
     */
    clearInvalidationQueue: (state) => {
      state.invalidationQueue = [];
    },

    /**
     * Prune old invalidation events
     */
    pruneInvalidationQueue: (state, action) => {
      const { olderThan = 60000 } = action.payload; // 1 minute default
      const cutoff = Date.now() - olderThan;
      state.invalidationQueue = state.invalidationQueue.filter(
        event => event.timestamp > cutoff
      );
    },
  },
});

export const {
  setCacheEntry,
  invalidateCacheEntry,
  invalidateCachePattern,
  updateCacheStats,
  startCacheWarming,
  updateWarmingProgress,
  completeCacheWarming,
  checkCacheValidity,
  clearAllCache,
  clearNamespaceCache,
  resetWarmingState,
  batchUpdateCacheEntries,
  clearInvalidationQueue,
  pruneInvalidationQueue,
} = cacheSlice.actions;

/**
 * Selectors
 */
export const selectCacheEntry = (state, endpoint) => state.cache.entries[endpoint];
export const selectCacheIsValid = (state, endpoint) => state.cache.entries[endpoint]?.isValid ?? false;
export const selectCacheStats = (state) => state.cache.stats;
export const selectWarmingState = (state) => state.cache.warming;
export const selectIsWarmingActive = (state) => state.cache.warming.isActive;
export const selectWarmingProgress = (state) => ({
  completed: state.cache.warming.progress,
  total: state.cache.warming.total,
  percentage: state.cache.warming.total > 0
    ? Math.round((state.cache.warming.progress / state.cache.warming.total) * 100)
    : 0,
  estimatedTimeRemaining: state.cache.warming.estimatedTimeRemaining,
});
export const selectInvalidationQueue = (state) => state.cache.invalidationQueue;
export const selectLastClearTime = (state) => state.cache.lastClearTime;

export default cacheSlice.reducer;
