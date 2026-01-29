/**
 * Loading Spinner Component
 */

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
