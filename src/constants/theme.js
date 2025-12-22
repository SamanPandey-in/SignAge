/**
 * Theme Constants
 * Centralized color scheme and styling constants for the entire application
 * Using a modern, accessible light mode color palette
 */

export const COLORS = {
  // Primary Brand Colors
  primary: '#4A90E2',        // Soft blue - main brand color
  primaryLight: '#6BA3E8',   // Lighter blue for hover states
  primaryDark: '#3A7BC8',    // Darker blue for pressed states
  
  // Secondary Colors
  secondary: '#50C878',      // Emerald green - for success and positive actions
  secondaryLight: '#6ED490', // Light green
  secondaryDark: '#3FA863',  // Dark green
  
  // Accent Colors
  accent: '#FF6B6B',         // Coral red - for important actions
  accentLight: '#FF8787',    // Light coral
  warning: '#FFA500',        // Orange - for warnings
  
  // Neutral Colors
  background: '#F8F9FA',     // Off-white background
  surface: '#FFFFFF',        // Pure white for cards and surfaces
  surfaceVariant: '#F0F2F5', // Light gray for subtle backgrounds
  
  // Text Colors
  textPrimary: '#1A1A1A',    // Almost black for primary text
  textSecondary: '#6B7280',  // Gray for secondary text
  textTertiary: '#9CA3AF',   // Light gray for tertiary text
  textInverse: '#FFFFFF',    // White text on dark backgrounds
  
  // Border and Divider Colors
  border: '#E5E7EB',         // Light gray border
  divider: '#F3F4F6',        // Very light gray divider
  
  // Status Colors
  success: '#10B981',        // Green for success messages
  error: '#EF4444',          // Red for error messages
  info: '#3B82F6',           // Blue for info messages
  
  // Overlay and Shadow
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

/**
 * Typography Constants
 * Font sizes and weights used throughout the app
 */
export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

/**
 * Spacing Constants
 * Consistent spacing values for margins and paddings
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border Radius Constants
 * Consistent border radius values for rounded corners
 */
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999, // For circular elements
};

/**
 * Shadow Presets
 * Pre-defined shadow styles for elevation
 */
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Animation Constants
 * Timing values for consistent animations
 */
export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

/**
 * App-wide Configuration Constants
 */
export const APP_CONFIG = {
  appName: 'SignAge',
  version: '1.0.0',
  minSwipeDistance: 50,
  maxLessonsPerDay: 10,
  cameraAspectRatio: 4 / 3,
};
