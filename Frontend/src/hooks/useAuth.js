/**
 * useAuth Hook
 * Provides auth functionality and state
 * Integrated with Redux for consistent error handling
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@services/firebase';
import { DataService } from '@services/dataService';
import { setUser, setLoading, setError, logout as logoutAction, selectUser, selectIsAuthenticated, selectIsLoading, selectAuthError } from '@store/slices/authSlice';
import { showError, showSuccess } from '@store/slices/notificationSlice';
import { ROUTES } from '@constants/routes';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const authError = useSelector(selectAuthError);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthChange((currentUser) => {
      dispatch(setUser(currentUser));
    });

    return () => unsubscribe();
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      dispatch(setLoading(true));
      await AuthService.login(email, password);
      dispatch(showSuccess('Login successful!'));
      // User will be set by onAuthChange listener
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch(setError(errorMessage));
      dispatch(showError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signup = async (email, password, displayName = 'User') => {
    try {
      dispatch(setLoading(true));
      await AuthService.signup(email, password, displayName);
      dispatch(showSuccess('Account created successfully!'));
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Sign up failed';
      dispatch(setError(errorMessage));
      dispatch(showError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      dispatch(logoutAction());
      // Clear cache on logout
      DataService.invalidateCache();
      dispatch(showSuccess('Logged out successfully'));
      navigate(ROUTES.LANDING);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      dispatch(setError(errorMessage));
      dispatch(showError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error: authError,
    login,
    signup,
    logout,
  };
};
