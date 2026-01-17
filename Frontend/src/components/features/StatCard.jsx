/**
 * Stat Card Component
 * Displays statistics in a consistent format
 */

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = 'primary',
  trend,
  trendLabel,
  onClick,
  gradient = false,
}) => {
  const colors = {
    primary: {
      bg: gradient ? 'from-primary-500 to-primary-600' : 'bg-primary-100',
      icon: 'text-primary-500',
      text: 'text-primary-600',
    },
    success: {
      bg: gradient ? 'from-success-500 to-success-600' : 'bg-success-100',
      icon: 'text-success-500',
      text: 'text-success-600',
    },
    warning: {
      bg: gradient ? 'from-warning-500 to-warning-600' : 'bg-warning-100',
      icon: 'text-warning-500',
      text: 'text-warning-600',
    },
    danger: {
      bg: gradient ? 'from-danger-500 to-danger-600' : 'bg-danger-100',
      icon: 'text-danger-500',
      text: 'text-danger-600',
    },
  };

  const colorScheme = colors[color] || colors.primary;

  return (
    <div
      onClick={onClick}
      className={`${
        gradient ? `bg-gradient-to-br ${colorScheme.bg} text-white` : 'bg-white'
      } rounded-xl p-6 shadow-soft hover:shadow-medium transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${gradient ? 'bg-white bg-opacity-20' : colorScheme.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`text-2xl ${gradient ? 'text-white' : colorScheme.icon}`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            gradient ? 'text-white text-opacity-90' : colorScheme.text
          }`}>
            <span>{trend > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className={`text-3xl font-bold mb-1 ${gradient ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      
      <div className={`text-sm ${gradient ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
        {label}
      </div>

      {trendLabel && (
        <div className={`text-xs mt-2 ${gradient ? 'text-white text-opacity-75' : 'text-gray-500'}`}>
          {trendLabel}
        </div>
      )}
    </div>
  );
};

export default StatCard;
