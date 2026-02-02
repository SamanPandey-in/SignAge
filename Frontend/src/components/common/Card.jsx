/**
 * Card Component
 */

const Card = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'soft',
  rounded = 'large',
  onClick,
  hover = false,
}) => {
  const paddings = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const shadows = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
  };

  const roundings = {
    none: '',
    small: 'rounded-lg',
    medium: 'rounded-xl',
    large: 'rounded-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        ${paddings[padding]}
        ${shadows[shadow]}
        ${roundings[rounded]}
        ${hover ? 'hover:shadow-medium transition-shadow cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
