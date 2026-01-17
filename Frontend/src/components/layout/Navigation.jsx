/**
 * Navigation Component
 * Top navigation bar
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import { IoHome, IoBook, IoPerson, IoLogOut } from 'react-icons/io5';
import Button from '@components/common/Button';

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path) => {
    if (path === ROUTES.HOME) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: ROUTES.HOME, icon: IoHome, label: 'Home' },
    { path: ROUTES.LEARN, icon: IoBook, label: 'Learn' },
    { path: ROUTES.PROFILE, icon: IoPerson, label: 'Profile' },
  ];

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LANDING} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-500">SignAge</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              {navLinks.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive(path)
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-xl" />
                  <span className="hidden sm:inline font-medium">{label}</span>
                </Link>
              ))}
              
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-danger-500 hover:bg-danger-50 transition-colors"
              >
                <IoLogOut className="text-xl" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          )}

          {/* Login Button for non-authenticated users */}
          {!isAuthenticated && location.pathname !== ROUTES.LOGIN && (
            <Link to={ROUTES.LOGIN}>
              <Button size="small">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
