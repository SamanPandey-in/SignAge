/**
 * Streak API Service
 * Handles streak-related API calls
 */

import apiClient from './axiosConfig';
import { API_ENDPOINTS } from '@constants/api';

export const streakApi = {
  /**
   * Get current streak
   */
  getStreak: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STREAK);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch streak',
      };
    }
  },

  /**
   * Update streak
   */
  updateStreak: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.UPDATE_STREAK);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update streak',
      };
    }
  },
};
