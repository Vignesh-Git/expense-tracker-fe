import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loginUser,
  signupUser,
  validateToken,
  logout,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectToken,
  selectIsAdmin,
  type LoginRequest,
  type SignupRequest,
} from '../store/slices/authSlice';

/**
 * Redux-based authentication hook
 * Provides authentication state and methods using Redux Toolkit
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();

  // Selectors for state
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const token = useAppSelector(selectToken);
  const isAdmin = useAppSelector(selectIsAdmin);

  // Authentication methods
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  const signup = useCallback(async (userData: SignupRequest): Promise<void> => {
    const result = await dispatch(signupUser(userData));
    if (signupUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  const logoutUser = useCallback(async (): Promise<void> => {
    dispatch(logout());
  }, [dispatch]);

  const validateUserToken = useCallback(async (): Promise<boolean> => {
    const result = await dispatch(validateToken());
    return validateToken.fulfilled.match(result);
  }, [dispatch]);

  const clearAuthError = useCallback((): void => {
    dispatch(clearError());
  }, [dispatch]);

  // Synchronous getters for immediate access
  const getCurrentUser = useCallback(() => user, [user]);
  const getCurrentToken = useCallback(() => token, [token]);
  const isCurrentlyAuthenticated = useCallback(() => isAuthenticated, [isAuthenticated]);
  const isCurrentlyAdmin = useCallback(() => isAdmin, [isAdmin]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    isAdmin,

    // Methods
    login,
    signup,
    logout: logoutUser,
    validateToken: validateUserToken,
    clearError: clearAuthError,

    // Synchronous getters
    getCurrentUser,
    getCurrentToken,
    isCurrentlyAuthenticated,
    isCurrentlyAdmin,
  };
};

export default useAuth; 