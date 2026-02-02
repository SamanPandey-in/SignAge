/**
 * Validation Utilities
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Returns object with isValid, strength, and message
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      strength: 'weak',
      message: `Password must be at least ${minLength} characters`,
    };
  }

  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
    .filter(Boolean).length;

  if (strengthScore < 2) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Password is too weak. Add uppercase, lowercase, numbers, or special characters.',
    };
  }

  if (strengthScore === 2) {
    return {
      isValid: true,
      strength: 'medium',
      message: 'Password strength: Medium',
    };
  }

  return {
    isValid: true,
    strength: 'strong',
    message: 'Password strength: Strong',
  };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

/**
 * Validate form fields
 */
export const validateForm = (fields) => {
  const errors = {};
  
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    
    // Check required
    if (field.required && !field.value) {
      errors[key] = `${field.label || key} is required`;
      return;
    }
    
    // Check email
    if (field.type === 'email' && field.value && !validateEmail(field.value)) {
      errors[key] = 'Invalid email format';
      return;
    }
    
    // Check password
    if (field.type === 'password' && field.value) {
      const validation = validatePassword(field.value);
      if (!validation.isValid) {
        errors[key] = validation.message;
        return;
      }
    }
    
    // Check min length
    if (field.minLength && field.value && field.value.length < field.minLength) {
      errors[key] = `Must be at least ${field.minLength} characters`;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
