/**
 * API Service Cache Integration
 * Phase 3: Enhance apiService with automatic caching
 * 
 * This module wraps apiService methods with transparent caching
 * Provides configurable TTLs and cache strategies
 */

import apiService from './apiService';
import cacheService from './cacheService';

/**
 * Default cache configurations per endpoint
 */
const CACHE_CONFIG = {
  '/lessons': { ttl: 5 * 60 * 1000, namespace: 'lessons' },           // 5 min
  '/progress': { ttl: 3 * 60 * 1000, namespace: 'progress' },         // 3 min
  '/streak': { ttl: 3 * 60 * 1000, namespace: 'streak' },             // 3 min
  '/health': { ttl: 1 * 60 * 1000, namespace: 'health' },             // 1 min
};

/**
 * Cached API Service Wrapper
 * Provides automatic caching for read operations
 */
class CachedAPIService {
  constructor() {
    this.cacheConfig = { ...CACHE_CONFIG };
  }

  /**
   * Configure cache for specific endpoint
   */
  setCacheConfig(endpoint, ttl, namespace = 'default') {
    this.cacheConfig[endpoint] = { ttl, namespace };
    console.debug(`[CachedAPI] Configured cache for ${endpoint}: TTL=${ttl}ms`);
  }

  /**
   * Get cache config for endpoint
   */
  getCacheConfig(endpoint) {
    return this.cacheConfig[endpoint] || { ttl: 10 * 60 * 1000, namespace: 'default' };
  }

  /**
   * Cached API call with fallback
   */
  async cachedCall(endpoint, fetcher, options = {}) {
    const {
      strategy = 'cache-first',
      cacheKey = endpoint,
      skipCache = false,
    } = options;

    if (skipCache) {
      return fetcher();
    }

    const config = this.getCacheConfig(endpoint);

    // Try cache first if strategy allows
    if (strategy === 'cache-first') {
      const cached = cacheService.get(cacheKey, config.namespace);
      if (cached !== null) {
        console.debug(`[CachedAPI] Cache hit for ${endpoint}`);
        return { ...cached, _source: 'cache' };
      }
    }

    // Fetch from API
    try {
      const result = await fetcher();

      // Cache successful results
      if (result?.success || (!result?.error)) {
        const dataToCache = result?.data || result;
        cacheService.set(cacheKey, dataToCache, config.namespace, config.ttl);
        console.debug(`[CachedAPI] Cached result for ${endpoint}`);
      }

      return result;
    } catch (error) {
      // Fall back to cache on error if strategy allows
      if (strategy === 'network-first') {
        const cached = cacheService.get(cacheKey, config.namespace);
        if (cached !== null) {
          console.debug(`[CachedAPI] Fallback to cache for ${endpoint}`);
          return { ...cached, _source: 'cache-fallback' };
        }
      }
      throw error;
    }
  }

  // ==================== ENDPOINT METHODS ====================

  /**
   * Get all lessons (cached)
   */
  async getAllLessons(options = {}) {
    return this.cachedCall(
      '/lessons',
      () => apiService.getAllLessons(),
      { cacheKey: 'all_lessons', ...options }
    );
  }

  /**
   * Get lesson by ID (cached)
   */
  async getLessonById(lessonId, options = {}) {
    return this.cachedCall(
      `/lessons/${lessonId}`,
      () => apiService.getLessonById(lessonId),
      { cacheKey: `lesson_${lessonId}`, ...options }
    );
  }

  /**
   * Complete lesson (not cached - mutation)
   */
  async completeLesson(id, score) {
    const result = await apiService.completeLesson(id, score);

    // Invalidate related caches
    if (result.success) {
      cacheService.invalidate('all_lessons', 'lessons');
      cacheService.invalidate('progress', 'progress');
    }

    return result;
  }

  /**
   * Get progress (cached)
   */
  async getProgress(options = {}) {
    return this.cachedCall(
      '/progress',
      () => apiService.getProgress(),
      { cacheKey: 'progress', ...options }
    );
  }

  /**
   * Update progress (not cached - mutation)
   */
  async updateProgress(data) {
    const result = await apiService.updateProgress(data);

    // Invalidate related caches
    if (result.success) {
      cacheService.invalidate('progress', 'progress');
    }

    return result;
  }

  /**
   * Get streak (cached)
   */
  async getStreak(options = {}) {
    return this.cachedCall(
      '/streak',
      () => apiService.getStreak(),
      { cacheKey: 'streak', ...options }
    );
  }

  /**
   * Update streak (not cached - mutation)
   */
  async updateStreak() {
    const result = await apiService.updateStreak();

    // Invalidate related caches
    if (result.success) {
      cacheService.invalidate('streak', 'streak');
      cacheService.invalidate('progress', 'progress');
    }

    return result;
  }

  /**
   * Predict sign (not cached - real-time)
   */
  async predictSign(frame, lessonId) {
    return apiService.predictSign(frame, lessonId);
  }

  /**
   * Health check (cached)
   */
  async healthCheck(options = {}) {
    return this.cachedCall(
      '/health',
      () => apiService.healthCheck(),
      { cacheKey: 'health', ...options }
    );
  }

  /**
   * Batch invalidate related endpoints after mutation
   */
  invalidateUserData() {
    console.debug('[CachedAPI] Invalidating all user data caches');
    cacheService.invalidate('progress', 'progress');
    cacheService.invalidate('streak', 'streak');
    cacheService.invalidate('all_lessons', 'lessons');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Clear specific cache
   */
  clearCache(namespace = null) {
    cacheService.clear(namespace);
  }

  /**
   * Export cache for debugging
   */
  exportCache() {
    return cacheService.export();
  }
}

/**
 * Singleton instance
 */
const cachedAPIService = new CachedAPIService();

export default cachedAPIService;
