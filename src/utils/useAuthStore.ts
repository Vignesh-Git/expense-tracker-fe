import { useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { authStore } from './authStore';
import type { AuthState, LoginRequest, SignupRequest, User } from './authStore';

/**
 * React hook for using the RxJS authentication store
 * Provides reactive authentication state and methods
 */
export const useAuthStore = () => {
  const [state, setState] = useState<AuthState>(authStore.getCurrentState());

  useEffect(() => {
    // Subscribe to auth store state changes
    const subscription = authStore.state$.subscribe(setState);

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Authentication methods
  const login = async (credentials: LoginRequest): Promise<void> => {
    return new Promise((resolve, reject) => {
      authStore.login(credentials).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
      });
    });
  };

  const signup = async (userData: SignupRequest): Promise<void> => {
    return new Promise((resolve, reject) => {
      authStore.signup(userData).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
      });
    });
  };

  const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
      authStore.logout().subscribe({
        next: () => resolve(),
        error: () => resolve() // Always resolve on logout, even if error
      });
    });
  };

  const validateToken = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      authStore.validateToken().subscribe({
        next: (isValid) => resolve(isValid),
        error: () => resolve(false)
      });
    });
  };

  const clearError = (): void => {
    authStore.clearError();
  };

  // Computed values
  const isAdmin = state.user?.role === 'admin' || false;

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    token: state.token,

    // Methods
    login,
    signup,
    logout,
    validateToken,
    clearError,

    // Computed
    isAdmin,

    // Synchronous getters (for immediate access)
    getCurrentUser: authStore.getCurrentUser.bind(authStore),
    getCurrentToken: authStore.getCurrentToken.bind(authStore),
    isCurrentlyAuthenticated: authStore.isCurrentlyAuthenticated.bind(authStore),
    isCurrentlyAdmin: authStore.isCurrentlyAdmin.bind(authStore),
  };
};

export default useAuthStore; 