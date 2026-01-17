/**
 * Query Service
 * Provides a consistent interface for querying data from various sources
 * Handles data normalization and transformation
 */

import { DataService } from '@services/dataService';
import { DatabaseService, AuthService } from '@services/firebase';

export const QueryService = {
  /**
   * Get user's profile information
   */
  async getUserProfile(userId) {
    try {
      const result = await DataService.fetchUserProfile(userId);
      return result;
    } catch (error) {
      console.error('Error in QueryService.getUserProfile:', error);
      throw error;
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const result = await DataService.fetchUserStats(userId);
      return result;
    } catch (error) {
      console.error('Error in QueryService.getUserStats:', error);
      throw error;
    }
  },

  /**
   * Get list of completed lessons
   */
  async getCompletedLessons(userId) {
    try {
      const result = await DataService.fetchCompletedLessons(userId);
      return result;
    } catch (error) {
      console.error('Error in QueryService.getCompletedLessons:', error);
      throw error;
    }
  },

  /**
   * Check if a lesson is completed
   */
  async isLessonCompleted(userId, lessonId) {
    try {
      const result = await DataService.fetchCompletedLessons(userId);
      
      if (!result.success) {
        return false;
      }

      return result.lessons.includes(lessonId);
    } catch (error) {
      console.error('Error in QueryService.isLessonCompleted:', error);
      return false;
    }
  },

  /**
   * Get user's current streak
   */
  async getUserStreak(userId) {
    try {
      const result = await DataService.fetchUserStats(userId);
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.streak || 0;
    } catch (error) {
      console.error('Error in QueryService.getUserStreak:', error);
      return 0;
    }
  },

  /**
   * Get today's progress for a user
   */
  async getTodayProgress(userId) {
    try {
      const result = await DataService.fetchUserStats(userId);
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.todayProgress || 0;
    } catch (error) {
      console.error('Error in QueryService.getTodayProgress:', error);
      return 0;
    }
  },

  /**
   * Get lessons completed count
   */
  async getLessonsCompletedCount(userId) {
    try {
      const result = await DataService.fetchUserStats(userId);
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.lessonsCompleted || 0;
    } catch (error) {
      console.error('Error in QueryService.getLessonsCompletedCount:', error);
      return 0;
    }
  },

  /**
   * Get total practice time
   */
  async getTotalPracticeTime(userId) {
    try {
      const result = await DataService.fetchUserStats(userId);
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.totalPracticeTime || 0;
    } catch (error) {
      console.error('Error in QueryService.getTotalPracticeTime:', error);
      return 0;
    }
  },

  /**
   * Get total stars earned
   */
  async getTotalStars(userId) {
    try {
      const result = await DataService.fetchUserStats(userId);
      
      if (!result.success) {
        return 0;
      }

      return result.stats?.totalStars || 0;
    } catch (error) {
      console.error('Error in QueryService.getTotalStars:', error);
      return 0;
    }
  },

  /**
   * Batch fetch multiple data points (optimized query)
   */
  async batchFetchUserData(userId, options = {}) {
    try {
      const {
        includeProfile = true,
        includeStats = true,
        includeLessons = true,
      } = options;

      const queries = [];

      if (includeProfile) {
        queries.push(DataService.fetchUserProfile(userId));
      }
      if (includeStats) {
        queries.push(DataService.fetchUserStats(userId));
      }
      if (includeLessons) {
        queries.push(DataService.fetchCompletedLessons(userId));
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
      console.error('Error in QueryService.batchFetchUserData:', error);
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
