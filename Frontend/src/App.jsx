import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@contexts/ThemeContext';
import store from '@store';
import { ROUTES } from '@constants/routes';
import Navigation from '@components/layout/Navigation';
import ProtectedRoute from '@components/layout/ProtectedRoute';
import ErrorBoundary from '@components/common/ErrorBoundary';
import Landing from '@pages/Landing';
import Login from '@pages/Login';
import Home from '@pages/Home';
import Learn from '@pages/Learn';
import LessonDetail from '@pages/LessonDetail';
import LessonContent from '@pages/LessonContent';
import Camera from '@pages/Camera';
import Profile from '@pages/Profile';
import Progress from '@pages/Progress';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main>
                <Routes>
                  <Route path={ROUTES.LANDING} element={<Landing />} />
                  <Route path={ROUTES.LOGIN} element={<Login />} />
                  <Route path={ROUTES.HOME} element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path={ROUTES.LEARN} element={<ProtectedRoute><Learn /></ProtectedRoute>} />
                  <Route path={ROUTES.LESSON_DETAIL} element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
                  <Route path={ROUTES.LESSON_CONTENT} element={<ProtectedRoute><LessonContent /></ProtectedRoute>} />
                  <Route path={ROUTES.CAMERA} element={<ProtectedRoute><Camera /></ProtectedRoute>} />
                  <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path={ROUTES.PROGRESS} element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
