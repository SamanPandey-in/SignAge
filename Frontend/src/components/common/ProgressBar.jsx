/**
 * ProgressBar Component
 */

const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  color = 'primary',
  height = 'medium',
  className = '',
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };

  const heights = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  };

  return (
    <div className={className}>
      <div className={`relative w-full ${heights[height]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`absolute top-0 left-0 h-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1">{percentage.toFixed(0)}%</p>
      )}
    </div>
  );
};

export default ProgressBar;
