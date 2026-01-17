/**
 * Data Service
 * Business logic layer that aggregates and manages data access
 * Phase 2 Integration: Now uses unified apiService instead of direct Firebase calls
 */

import apiService from '@services/apiService';

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
      // Check cache first
      if (isCacheValid(cache.userProfile)) {
        return {
          success: true,
          source: 'cache',
          data: cache.userProfile.data,
        };
      }

      // Fetch from API using Phase 2 apiService
      const [progressResult, streakResult, lessonsResult] = await Promise.all([
        apiService.getProgress(),
        apiService.getStreak(),
        apiService.getAllLessons(),
      ]);

      if (!progressResult.success) {
        throw new Error(progressResult.error || 'Failed to fetch user profile');
      }

      const profileData = {
        stats: { ...progressResult.data, streak: streakResult.data?.streak || 0 },
        completedLessons: lessonsResult.data?.filter(l => l.completed) || [],
      };

      // Cache the result
      cache.userProfile.data = profileData;
      cache.userProfile.timestamp = Date.now();

      return {
        success: true,
        source: 'api',
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
   * Uses Phase 2 apiService for unified API layer
   */
  async fetchUserStats() {
    try {
      // Check cache first
      if (isCacheValid(cache.userStats)) {
        return {
          success: true,
          source: 'cache',
          stats: cache.userStats.data,
        };
      }

      const result = await apiService.getProgress();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user stats');
      }

      // Cache the result
      cache.userStats.data = result.data;
      cache.userStats.timestamp = Date.now();

      return {
        success: true,
        source: 'database',
        stats: result.stats,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Fetch completed lessons
   * Uses Phase 2 apiService
   */
  async fetchCompletedLessons() {
    try {
      // Check cache first
      if (isCacheValid(cache.completedLessons)) {
        return {
          success: true,
          source: 'cache',
          lessons: cache.completedLessons.data,
        };
      }

      const result = await apiService.getAllLessons();
      
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
   * Invalidates cache on success
   */
  async updateUserProgress(progressData) {
    try {
      const result = await apiService.updateProgress(progressData);
      
      if (result.success) {
        // Invalidate relevant caches
        cache.userStats.data = null;
        cache.userProfile.data = null;
      }

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
   * Mark lesson as completed using Phase 2 apiService
   */
  async markLessonCompleted(lessonId, score) {
    try {
      const result = await apiService.completeLesson(lessonId, score);

      if (result.success) {
        // Invalidate relevant caches
        cache.userProfile.data = null;
        cache.userStats.data = null;
        cache.completedLessons.data = null;
      }

      return result;
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
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
      const result = await apiService.updateProgress({ todayProgress: progress });

      if (result.success) {
        // Invalidate cache
        cache.userStats.data = null;
        cache.userProfile.data = null;
      }

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
   * Update user streak using Phase 2 apiService
   */
  async updateUserStreak() {
    try {
      const result = await apiService.updateStreak();

      if (result.success) {
        // Invalidate cache
        cache.userStats.data = null;
        cache.userProfile.data = null;
      }

      return result;
    } catch (error) {
      console.error('Error updating streak:', error);
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
