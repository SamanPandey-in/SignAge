export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  HOME: '/home',
  LEARN: '/learn',
  LESSON_DETAIL: '/learn/:lessonId',
  LESSON_CONTENT: '/lesson/:lessonId',
  CAMERA: '/camera',
  PROFILE: '/profile',
  PROGRESS: '/progress',
};

export const generatePath = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

export const isPublicRoute = (pathname) => {
  const publicRoutes = [ROUTES.LANDING, ROUTES.LOGIN];
  return publicRoutes.includes(pathname);
};
