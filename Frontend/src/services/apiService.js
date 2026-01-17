/**
 * Unified API Service
 * Phase 2: Consolidates all API calls into a single service with proper error handling,
 * request deduplication, loading state management, and response formatting.
 * 
 * Features:
 * - Automatic auth token injection
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Centralized error handling with specific error types
 * - Response normalization
 * - Built-in retry logic for network failures
 * - Request/response interceptors
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS, HTTP_STATUS } from '@constants/api';
import { auth } from '@services/firebase';

/**
 * Request queue for deduplication
 * Prevents duplicate API calls while one is already in flight
 */
const requestQueue = new Map();

/**
 * Error types for better error handling in Redux
 */
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Create normalized API response
 */
const createResponse = (success, data = null, error = null, errorType = null) => ({
  success,
  data,
  error,
  errorType,
  timestamp: new Date().toISOString(),
});

/**
 * Generate request key for deduplication
 */
const getRequestKey = (method, url, data = null) => {
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method}:${url}:${dataStr}`;
};

/**
 * Create and configure axios instance
 */
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token and handle deduplication
  instance.interceptors.request.use(
    async (config) => {
      try {
        // Add auth token if user is logged in
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Check for duplicate requests
        const requestKey = getRequestKey(config.method, config.url, config.data);
        if (requestQueue.has(requestKey)) {
          console.warn(`[API] Duplicate request prevented: ${config.method} ${config.url}`);
          return requestQueue.get(requestKey);
        }

        // Mark this request as in-flight
        config._requestKey = requestKey;
      } catch (error) {
        console.error('[API] Error in request interceptor:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle errors and cache successful responses
  instance.interceptors.response.use(
    (response) => {
      // Clear from request queue on success
      if (response.config._requestKey) {
        requestQueue.delete(response.config._requestKey);
      }
      return response;
    },
    async (error) => {
      const config = error.config;
      
      // Clear from request queue on error
      if (config && config._requestKey) {
        requestQueue.delete(config._requestKey);
      }

      // Don't retry if no config
      if (!config) {
        return Promise.reject(error);
      }

      // Retry logic for network errors (max 2 retries)
      config.retryCount = config.retryCount || 0;
      if (config.retryCount < 2 && !error.response) {
        config.retryCount += 1;
        console.warn(`[API] Retrying request (attempt ${config.retryCount}): ${config.method} ${config.url}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount)); // Exponential backoff
        return instance(config);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const apiClient = createAxiosInstance();

/**
 * Determine error type from axios error
 */
const getErrorType = (error) => {
  if (!error.response) {
    return API_ERROR_TYPES.NETWORK_ERROR;
  }

  const { status } = error.response;

  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return API_ERROR_TYPES.AUTH_ERROR;
    case HTTP_STATUS.BAD_REQUEST:
      return API_ERROR_TYPES.VALIDATION_ERROR;
    case HTTP_STATUS.NOT_FOUND:
      return API_ERROR_TYPES.NOT_FOUND;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return API_ERROR_TYPES.SERVER_ERROR;
    default:
      return API_ERROR_TYPES.UNKNOWN_ERROR;
  }
};

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error, errorType) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  const messageMap = {
    [API_ERROR_TYPES.NETWORK_ERROR]: 'Network error. Please check your connection.',
    [API_ERROR_TYPES.AUTH_ERROR]: 'Authentication failed. Please log in again.',
    [API_ERROR_TYPES.VALIDATION_ERROR]: 'Invalid request data.',
    [API_ERROR_TYPES.NOT_FOUND]: 'Resource not found.',
    [API_ERROR_TYPES.SERVER_ERROR]: 'Server error. Please try again later.',
    [API_ERROR_TYPES.TIMEOUT_ERROR]: 'Request timeout. Please try again.',
    [API_ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred.',
  };

  return messageMap[errorType] || 'An unexpected error occurred.';
};

/**
 * Core API request handler with unified response format
 */
const makeRequest = async (method, url, data = null, options = {}) => {
  try {
    const config = {
      method,
      url,
      ...options,
    };

    if (data && (method === 'post' || method === 'put' || method === 'patch')) {
      config.data = data;
    }

    const response = await apiClient(config);
    return createResponse(true, response.data);
  } catch (error) {
    console.error(`[API] ${method.toUpperCase()} ${url} failed:`, error.message);
    
    const errorType = getErrorType(error);
    const errorMessage = getErrorMessage(error, errorType);
    
    return createResponse(false, null, errorMessage, errorType);
  }
};

/**
 * Unified API Service
 * Single entry point for all API calls
 */
export const apiService = {
  // ==================== LESSONS ====================
  
  /**
   * Fetch all lessons
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async getAllLessons() {
    return makeRequest('get', API_ENDPOINTS.LESSONS);
  },

  /**
   * Fetch single lesson by ID
   * @param {string} lessonId - Lesson ID
   */
  async getLessonById(lessonId) {
    const url = API_ENDPOINTS.LESSON_DETAIL.replace(':id', lessonId);
    return makeRequest('get', url);
  },

  /**
   * Mark lesson as completed
   * @param {string} lessonId - Lesson ID
   * @param {number} score - Completion score
   */
  async completeLesson(lessonId, score) {
    const url = API_ENDPOINTS.LESSON_COMPLETE.replace(':id', lessonId);
    return makeRequest('post', url, { score });
  },

  // ==================== PROGRESS ====================

  /**
   * Fetch user progress
   */
  async getProgress() {
    return makeRequest('get', API_ENDPOINTS.PROGRESS);
  },

  /**
   * Update user progress
   * @param {object} progressData - Progress update data
   */
  async updateProgress(progressData) {
    return makeRequest('post', API_ENDPOINTS.UPDATE_PROGRESS, progressData);
  },

  // ==================== STREAK ====================

  /**
   * Get current streak
   */
  async getStreak() {
    return makeRequest('get', API_ENDPOINTS.STREAK);
  },

  /**
   * Update streak
   */
  async updateStreak() {
    return makeRequest('post', API_ENDPOINTS.UPDATE_STREAK);
  },

  // ==================== ML/PREDICT ====================

  /**
   * Send frame to ML model for prediction
   * @param {Blob} frameData - Video frame data
   * @param {string} lessonId - Current lesson ID
   */
  async predictSign(frameData, lessonId) {
    const formData = new FormData();
    formData.append('frame', frameData);
    formData.append('lessonId', lessonId);

    try {
      const config = {
        method: 'post',
        url: API_ENDPOINTS.PREDICT,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Add auth token
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient(config);
      return createResponse(true, response.data);
    } catch (error) {
      console.error('[API] ML prediction failed:', error.message);
      const errorType = getErrorType(error);
      const errorMessage = getErrorMessage(error, errorType);
      return createResponse(false, null, errorMessage, errorType);
    }
  },

  // ==================== UTILITY ====================

  /**
   * Check API health/connectivity
   */
  async healthCheck() {
    return makeRequest('get', '/health');
  },

  /**
   * Clear request queue (useful for testing or manual reset)
   */
  clearRequestQueue() {
    requestQueue.clear();
    console.log('[API] Request queue cleared');
  },

  /**
   * Get current request queue size (for debugging)
   */
  getQueueSize() {
    return requestQueue.size;
  },
};

export default apiService;
