/**
 * Toast Notification Component
 * Displays temporary notifications
 */

import { useEffect } from 'react';
import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoClose } from 'react-icons/io5';

const Toast = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: IoCheckmarkCircle,
    warning: IoWarning,
    error: IoWarning,
    info: IoInformationCircle,
  };

  const colors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-danger-500',
    info: 'bg-primary-500',
  };

  const Icon = icons[type];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-large border border-gray-200 p-4 flex items-center space-x-3 max-w-md">
        <div className={`w-10 h-10 ${colors[type]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-2xl text-white" />
        </div>
        <p className="text-gray-900 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <IoClose className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
