/**
 * Lesson API Service
 * Handles all lesson-related API calls
 */

import apiClient from './axiosConfig';
import { API_ENDPOINTS } from '@constants/api';

export const lessonApi = {
  /**
   * Fetch all lessons
   */
  getAllLessons: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LESSONS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch lessons',
      };
    }
  },

  /**
   * Fetch single lesson by ID
   */
  getLessonById: async (lessonId) => {
    try {
      const url = API_ENDPOINTS.LESSON_DETAIL.replace(':id', lessonId);
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch lesson',
      };
    }
  },

  /**
   * Mark lesson as completed
   */
  completeLesson: async (lessonId, score) => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.LESSONS}/${lessonId}/complete`, {
        score,
        completedAt: new Date().toISOString(),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to complete lesson',
      };
    }
  },
};
