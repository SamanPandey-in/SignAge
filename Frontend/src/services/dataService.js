/**
 * Data Service
 * Business logic layer that aggregates and manages data access
 * Phase 3: Now uses cachedAPIService for automatic caching + Phase 2 apiService
 */

import cachedAPIService from '@services/cachedAPIService';

/**
 * Cache configuration to prevent unnecessary API calls
 */
const cache = {
  userProfile: { data: null, timestamp: null, ttl: 5 * 60 * 1000 }, // 5 minutes
  userStats: { data: null, timestamp: null, ttl: 3 * 60 * 1000 }, // 3 minutes
  completedLessons: { data: null, timestamp: null, ttl: 5 * 60 * 1000 }, // 5 minutes
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry.data || !cacheEntry.timestamp) return false;
  return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
};

/**
 * Clear all cached data
 */
const clearCache = () => {
  Object.keys(cache).forEach(key => {
    cache[key] = { data: null, timestamp: null, ttl: cache[key].ttl };
  });
};

export const DataService = {
  /**
   * Fetch complete user profile with stats and lessons
   * Implements caching to reduce API calls
   * Uses Phase 2 apiService for unified API layer
   */
  async fetchUserProfile() {
    try {
      // Phase 3: Use cachedAPIService for automatic TTL-based caching
      const [progressResult, streakResult, lessonsResult] = await Promise.all([
        cachedAPIService.getProgress(),
        cachedAPIService.getStreak(),
        cachedAPIService.getAllLessons(),
      ]);

      if (!progressResult.success) {
        throw new Error(progressResult.error || 'Failed to fetch user profile');
      }

      const profileData = {
        stats: { ...progressResult.data, streak: streakResult.data?.streak || 0 },
        completedLessons: lessonsResult.data?.filter(l => l.completed) || [],
      };

      return {
        success: true,
        source: 'api', // could be 'cache' if returned from cachedAPIService cache
        data: profileData,
      };
    } catch (error) {
      console.error('[DataService] Error fetching user profile:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Fetch user statistics
   * Phase 3: Uses cachedAPIService for automatic caching
   */
  async fetchUserStats() {
    try {
      // Phase 3: Use cachedAPIService with automatic TTL caching
      const result = await cachedAPIService.getProgress();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user stats');
      }

      return {
        success: true,
        source: 'api', // may come from cache in cachedAPIService
        stats: result.data,
      };
    } catch (error) {
      console.error('[DataService] Error fetching user stats:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Fetch completed lessons
   * Phase 3: Uses cachedAPIService
   */
  async fetchCompletedLessons() {
    try {
      // Phase 3: Use cachedAPIService for automatic caching
      const result = await cachedAPIService.getAllLessons();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch completed lessons');
      }

      const completedLessons = result.data?.filter(l => l.completed) || [];
      
      // Cache the result
      cache.completedLessons.data = completedLessons;
      cache.completedLessons.timestamp = Date.now();

      return {
        success: true,
        source: 'api',
        lessons: completedLessons,
      };
    } catch (error) {
      console.error('[DataService] Error fetching completed lessons:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update user progress using Phase 2 apiService
   * Phase 3: Uses cachedAPIService which auto-invalidates related caches
   */
  async updateUserProgress(progressData) {
    try {
      // Phase 3: cachedAPIService automatically invalidates 'progress' cache
      const result = await cachedAPIService.updateProgress(progressData);
      
      return result;
    } catch (error) {
      console.error('[DataService] Error updating user progress:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Mark lesson as completed
   * Phase 3: Uses cachedAPIService with automatic cache invalidation
   */
  async markLessonCompleted(lessonId, score) {
    try {
      // Phase 3: cachedAPIService auto-invalidates 'all_lessons' and 'progress' caches
      const result = await cachedAPIService.completeLesson(lessonId, score);

      return result;
    } catch (error) {
      console.error('[DataService] Error marking lesson as completed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update today's progress using Phase 2 apiService
   */
  async updateTodayProgress(progress) {
    try {
      // Phase 3: cachedAPIService auto-invalidates 'progress' cache
      const result = await cachedAPIService.updateProgress({ todayProgress: progress });
      return result;
    } catch (error) {
      console.error('[DataService] Error updating today progress:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update user streak
   * Phase 3: Uses cachedAPIService with automatic cache invalidation
   */
  async updateUserStreak() {
    try {
      // Phase 3: cachedAPIService auto-invalidates 'streak' and 'progress' caches
      const result = await cachedAPIService.updateStreak();
      return result;
    } catch (error) {
      console.error('[DataService] Error updating streak:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Invalidate all caches (useful on logout or user switch)
   */
  invalidateCache: clearCache,

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats: () => {
    const stats = {};
    Object.keys(cache).forEach(key => {
      stats[key] = {
        cached: !!cache[key].data,
        age: cache[key].timestamp ? Date.now() - cache[key].timestamp : null,
        valid: isCacheValid(cache[key]),
      };
    });
    return stats;
  },
};
