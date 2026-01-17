/**
 * Query Service
 * Provides a consistent interface for querying data from various sources
 * Phase 2 Integration: Uses DataService which now uses unified apiService
 */

import { DataService } from '@services/dataService';
import apiService from '@services/apiService';

export const QueryService = {
  /**
   * Get user's profile information using Phase 2 apiService
   */
  async getUserProfile() {
    try {
      const result = await DataService.fetchUserProfile();
      return result;
    } catch (error) {
      console.error('[QueryService] Error in getUserProfile:', error);
      throw error;
    }
  },

  /**
   * Get user statistics using Phase 2 apiService
   */
  async getUserStats() {
    try {
      const result = await DataService.fetchUserStats();
      return result;
    } catch (error) {
      console.error('[QueryService] Error in getUserStats:', error);
      throw error;
    }
  },

  /**
   * Get list of completed lessons using Phase 2 apiService
   */
  async getCompletedLessons() {
    try {
      const result = await DataService.fetchCompletedLessons();
      return result;
    } catch (error) {
      console.error('[QueryService] Error in getCompletedLessons:', error);
      throw error;
    }
  },

  /**
   * Check if a lesson is completed
   */
  async isLessonCompleted(lessonId) {
    try {
      const result = await DataService.fetchCompletedLessons();
      
      if (!result.success) {
        return false;
      }

      return result.lessons.some(l => l.id === lessonId);
    } catch (error) {
      console.error('[QueryService] Error in isLessonCompleted:', error);
      return false;
    }
  },

  /**
   * Get user's current streak using Phase 2 apiService
   */
  async getUserStreak() {
    try {
      const result = await apiService.getStreak();
      
      if (!result.success) {
        return 0;
      }

      return result.data?.streak || 0;
    } catch (error) {
      console.error('[QueryService] Error in getUserStreak:', error);
      return 0;
    }
  },

  /**
   * Get today's progress for a user
   */
  async getTodayProgress() {
    try {
      const result = await apiService.getProgress();
      
      if (!result.success) {
        return 0;
      }

      return result.data?.todayProgress || 0;
    } catch (error) {
      console.error('[QueryService] Error in getTodayProgress:', error);
      return 0;
    }
  },

  /**
   * Get lessons completed count
   */
  async getLessonsCompletedCount() {
    try {
      const result = await DataService.fetchUserStats();
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.lessonsCompleted || 0;
    } catch (error) {
      console.error('[QueryService] Error in getLessonsCompletedCount:', error);
      return 0;
    }
  },

  /**
   * Get total practice time
   */
  async getTotalPracticeTime() {
    try {
      const result = await DataService.fetchUserStats();
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.totalPracticeTime || 0;
    } catch (error) {
      console.error('[QueryService] Error in getTotalPracticeTime:', error);
      return 0;
    }
  },

  /**
   * Get total stars earned
   */
  async getTotalStars() {
    try {
      const result = await DataService.fetchUserStats();
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.totalStars || 0;
    } catch (error) {
      console.error('[QueryService] Error in getTotalStars:', error);
      return 0;
    }
  },

  /**
   * Batch fetch multiple data points (optimized query using Phase 2 apiService)
   */
  async batchFetchUserData(options = {}) {
    try {
      const {
        includeProfile = true,
        includeStats = true,
        includeLessons = true,
      } = options;

      const queries = [];

      if (includeProfile) {
        queries.push(DataService.fetchUserProfile());
      }
      if (includeStats) {
        queries.push(DataService.fetchUserStats());
      }
      if (includeLessons) {
        queries.push(DataService.fetchCompletedLessons());
      }

      const results = await Promise.all(queries);

      const data = {};
      let resultIndex = 0;

      if (includeProfile) {
        data.profile = results[resultIndex++].data;
      }
      if (includeStats) {
        data.stats = results[resultIndex++].stats;
      }
      if (includeLessons) {
        data.lessons = results[resultIndex++].lessons;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('[QueryService] Error in batchFetchUserData:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Clear all cached data
   */
  clearCache: () => {
    DataService.invalidateCache();
  },

  /**
   * Get cache debugging info
   */
  getCacheInfo: () => {
    return DataService.getCacheStats();
  },
};
