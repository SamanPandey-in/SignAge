export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  LESSONS: '/lessons',
  LESSON_DETAIL: '/lessons/:id',
  PROGRESS: '/progress',
  UPDATE_PROGRESS: '/progress/update',
  STREAK: '/streak',
  UPDATE_STREAK: '/streak/update',
  PREDICT: '/ml/predict',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const API_TIMEOUT = 30000;
