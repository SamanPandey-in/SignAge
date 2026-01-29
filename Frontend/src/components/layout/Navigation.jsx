/**
 * Navigation Component
 * Top navigation bar
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import { IoHome, IoBook, IoTrophy, IoPerson, IoLogOut } from 'react-icons/io5';
import Button from '@components/common/Button';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
    { path: ROUTES.PROGRESS, icon: IoTrophy, label: 'Progress' },
    { path: ROUTES.PROFILE, icon: IoPerson, label: 'Profile' },
  ];

  return (
    <nav className="py-6 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LANDING} className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            SignAge
          </span>
        </Link>

        {/* Navigation Links and Actions */}
        {isAuthenticated && (
          <div className="flex items-center gap-6">
            {navLinks.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="text-xl" />
                <span className="hidden sm:inline font-medium">{label}</span>
              </Link>
            ))}
            
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <IoLogOut className="text-xl" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        )}

        {/* Login Button for non-authenticated users */}
        {!isAuthenticated && location.pathname !== ROUTES.LOGIN && (
          <Button variant="outline" size="small" onClick={() => navigate(ROUTES.LOGIN)}>
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
