// Authentication service for handling API calls and token management

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Authentication service class
 * Handles login, signup, token management, and user state
 */
class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Initialize from localStorage on service creation
    this.token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get current user information
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  /**
   * Store authentication data
   */
  private setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Make authenticated API request
   */
  private async makeAuthRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge with existing headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * User signup
   */
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if token exists
      if (this.token) {
        await this.makeAuthRequest(`${API_BASE_URL}/auth/logout`, {
          method: 'GET',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Validate token with server
   */
  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/auth/validate`);
      if (!response.ok) {
        this.clearAuth();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 