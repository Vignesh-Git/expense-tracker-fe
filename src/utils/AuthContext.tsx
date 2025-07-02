import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from './authService';
import type { User, LoginRequest, SignupRequest, AuthResponse } from './authService';

// Authentication context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props interface for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to child components
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const currentUser = authService.getUser();
          setUser(currentUser);
          
          // Optionally validate token with server
          const isValid = await authService.validateToken();
          if (!isValid) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user login
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user signup
   */
  const signup = async (userData: SignupRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.signup(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if current user is admin
   */
  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  // Context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * @returns Authentication context value
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 