/**
 * useNotification Hook
 * Provides convenient access to notification Redux state and actions
 * Replaces scattered toast/error handling throughout the app
 */

import { useDispatch, useSelector } from 'react-redux';
import {
  selectNotifications,
  selectNotificationCount,
  selectHasErrors,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  removeNotification,
  clearAllNotifications,
} from '@store/slices/notificationSlice';

export const useNotification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const notificationCount = useSelector(selectNotificationCount);
  const hasErrors = useSelector(selectHasErrors);

  return {
    // State
    notifications,
    notificationCount,
    hasErrors,

    // Actions
    success: (message) => dispatch(showSuccess(message)),
    error: (message) => dispatch(showError(message)),
    warning: (message) => dispatch(showWarning(message)),
    info: (message) => dispatch(showInfo(message)),
    remove: (id) => dispatch(removeNotification(id)),
    clearAll: () => dispatch(clearAllNotifications()),
  };
};
