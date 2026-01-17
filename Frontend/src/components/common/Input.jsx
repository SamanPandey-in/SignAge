/**
 * Input Component
 */

const Input = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-danger-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && (
        <p className="text-danger-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
