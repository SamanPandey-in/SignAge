/**
 * Progress API Service
 * Handles all progress-related API calls
 */

import apiClient from './axiosConfig';
import { API_ENDPOINTS } from '@constants/api';

export const progressApi = {
  /**
   * Fetch user progress
   */
  getProgress: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROGRESS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch progress',
      };
    }
  },

  /**
   * Update user progress
   */
  updateProgress: async (progressData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.UPDATE_PROGRESS, progressData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update progress',
      };
    }
  },
};
