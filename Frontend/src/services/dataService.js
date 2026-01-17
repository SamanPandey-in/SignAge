/**
 * Data Service
 * Business logic layer that aggregates and manages data access
 * Serves as a bridge between Redux and Firebase/API services
 */

import { DatabaseService, AuthService } from '@services/firebase';

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
   * Implements caching to reduce database calls
   */
  async fetchUserProfile(userId) {
    try {
      // Check cache first
      if (isCacheValid(cache.userProfile)) {
        return {
          success: true,
          source: 'cache',
          data: cache.userProfile.data,
        };
      }

      // Fetch from database
      const [profileResult, statsResult, lessonsResult] = await Promise.all([
        DatabaseService.getUserData(userId),
        DatabaseService.getUserStats(userId),
        DatabaseService.getCompletedLessons(userId),
      ]);

      if (!profileResult.success) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = {
        profile: profileResult.data,
        stats: statsResult.success ? statsResult.stats : {},
        completedLessons: lessonsResult.success ? lessonsResult.lessons : [],
      };

      // Cache the result
      cache.userProfile.data = profileData;
      cache.userProfile.timestamp = Date.now();

      return {
        success: true,
        source: 'database',
        data: profileData,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Fetch user statistics
   * Cached separately for more frequent updates
   */
  async fetchUserStats(userId) {
    try {
      // Check cache first
      if (isCacheValid(cache.userStats)) {
        return {
          success: true,
          source: 'cache',
          stats: cache.userStats.data,
        };
      }

      const result = await DatabaseService.getUserStats(userId);
      
      if (!result.success) {
        throw new Error('Failed to fetch user stats');
      }

      // Cache the result
      cache.userStats.data = result.stats;
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
   */
  async fetchCompletedLessons(userId) {
    try {
      // Check cache first
      if (isCacheValid(cache.completedLessons)) {
        return {
          success: true,
          source: 'cache',
          lessons: cache.completedLessons.data,
        };
      }

      const result = await DatabaseService.getCompletedLessons(userId);
      
      if (!result.success) {
        throw new Error('Failed to fetch completed lessons');
      }

      // Cache the result
      cache.completedLessons.data = result.lessons;
      cache.completedLessons.timestamp = Date.now();

      return {
        success: true,
        source: 'database',
        lessons: result.lessons,
      };
    } catch (error) {
      console.error('Error fetching completed lessons:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update user progress and invalidate cache
   */
  async updateUserProgress(userId, progressData) {
    try {
      const result = await DatabaseService.updateUserProgress(userId, progressData);
      
      if (result.success) {
        // Invalidate relevant caches
        cache.userStats.data = null;
        cache.userProfile.data = null;
      }

      return result;
    } catch (error) {
      console.error('Error updating user progress:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Mark lesson as completed and update stats
   */
  async markLessonCompleted(userId, lessonId, score, stars, signsLearned) {
    try {
      const result = await DatabaseService.markLessonCompleted(
        userId,
        lessonId,
        score,
        stars,
        signsLearned
      );

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
   * Update today's progress
   */
  async updateTodayProgress(userId, progress) {
    try {
      const result = await DatabaseService.updateTodayProgress(userId, progress);

      if (result.success) {
        // Invalidate cache
        cache.userStats.data = null;
        cache.userProfile.data = null;
      }

      return result;
    } catch (error) {
      console.error('Error updating today progress:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update user streak
   */
  async updateUserStreak(userId, streak) {
    try {
      const result = await DatabaseService.updateUserStreak(userId, streak);

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
