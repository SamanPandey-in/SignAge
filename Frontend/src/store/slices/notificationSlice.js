/**
 * Notification Redux Slice
 * Centralized management for toasts, error messages, and success notifications
 * Single source of truth for all UI notifications
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], // Array of { id, type, message, duration }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Add a notification (toast)
     */
    addNotification: (state, action) => {
      const { type = 'info', message, duration = 7000 } = action.payload;
      const id = Date.now();

      state.notifications.push({
        id,
        type, // 'success', 'error', 'warning', 'info'
        message,
        duration,
      });

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }, duration);
      }
    },

    /**
     * Show success notification
     */
    showSuccess: (state, action) => {
      const id = Date.now();
      const message = typeof action.payload === 'string' 
        ? action.payload 
        : action.payload.message || 'Success!';
      
      const duration = 7000;
      state.notifications.push({
        id,
        type: 'success',
        message,
        duration,
      });

      setTimeout(() => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }, duration);
    },

    /**
     * Show error notification
     */
    showError: (state, action) => {
      const id = Date.now();
      const message = typeof action.payload === 'string'
        ? action.payload
        : action.payload.message || 'An error occurred';
      
      const duration = 7000;
      state.notifications.push({
        id,
        type: 'error',
        message,
        duration,
      });

      setTimeout(() => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }, duration);
    },

    /**
     * Show warning notification
     */
    showWarning: (state, action) => {
      const id = Date.now();
      const message = typeof action.payload === 'string'
        ? action.payload
        : action.payload.message || 'Warning';
      
      const duration = 7000;
      state.notifications.push({
        id,
        type: 'warning',
        message,
        duration,
      });

      setTimeout(() => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }, duration);
    },

    /**
     * Show info notification
     */
    showInfo: (state, action) => {
      const id = Date.now();
      const message = typeof action.payload === 'string'
        ? action.payload
        : action.payload.message || 'Info';
      
      const duration = 7000;
      state.notifications.push({
        id,
        type: 'info',
        message,
        duration,
      });

      setTimeout(() => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }, duration);
    },

    /**
     * Remove a specific notification
     */
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },

    /**
     * Clear all notifications
     */
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

// Actions
export const {
  addNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  removeNotification,
  clearAllNotifications,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectNotificationCount = (state) => state.notifications.notifications.length;
export const selectHasErrors = (state) =>
  state.notifications.notifications.some(n => n.type === 'error');

export default notificationSlice.reducer;
