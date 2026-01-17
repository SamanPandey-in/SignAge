/**
 * useAuth Hook
 * Provides auth functionality and state
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@services/firebase';
import { setUser, setLoading, setError, logout as logoutAction, selectUser, selectIsAuthenticated, selectIsLoading } from '@store/slices/authSlice';
import { ROUTES } from '@constants/routes';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

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
      // User will be set by onAuthChange listener
      return { success: true };
    } catch (error) {
      dispatch(setError(error.message));
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password) => {
    try {
      dispatch(setLoading(true));
      await AuthService.signup(email, password);
      return { success: true };
    } catch (error) {
      dispatch(setError(error.message));
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      dispatch(logoutAction());
      navigate(ROUTES.LANDING);
      return { success: true };
    } catch (error) {
      dispatch(setError(error.message));
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
  };
};
