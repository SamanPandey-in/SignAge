/**
 * Notification Center Component
 * Displays all notifications (toasts) from Redux state
 * Should be rendered at app level
 */

import { useSelector } from 'react-redux';
import { selectNotifications } from '@store/slices/notificationSlice';
import { IoCheckmarkCircle, IoWarning, IoInformation, IoClose } from 'react-icons/io5';
import { useNotification } from '@hooks/useNotification';

const NotificationCenter = () => {
  const notifications = useSelector(selectNotifications);
  const { remove } = useNotification();

  const getIconAndColor = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: IoCheckmarkCircle,
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          textColor: 'text-success-800',
          iconColor: 'text-success-600',
        };
      case 'error':
        return {
          icon: IoWarning,
          bgColor: 'bg-danger-50',
          borderColor: 'border-danger-200',
          textColor: 'text-danger-800',
          iconColor: 'text-danger-600',
        };
      case 'warning':
        return {
          icon: IoWarning,
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200',
          textColor: 'text-warning-800',
          iconColor: 'text-warning-600',
        };
      case 'info':
      default:
        return {
          icon: IoInformation,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => {
        const { icon: Icon, bgColor, borderColor, textColor, iconColor } =
          getIconAndColor(notification.type);

        return (
          <div
            key={notification.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg border
              ${bgColor} ${borderColor} ${textColor}
              shadow-md animate-fade-in
            `}
            role="alert"
          >
            <Icon className={`flex-shrink-0 text-xl mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => remove(notification.id)}
              className={`flex-shrink-0 ${iconColor} hover:opacity-70 transition-opacity`}
              aria-label="Close notification"
            >
              <IoClose className="text-lg" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCenter;
