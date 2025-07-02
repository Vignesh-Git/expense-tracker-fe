import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

// Types and interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000';

/**
 * RxJS-based Authentication Store
 * Manages authentication state using reactive programming
 */
class AuthStore {
  // Private subjects for state management
  private readonly _state$ = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Public observables
  public readonly state$ = this._state$.asObservable();
  public readonly user$ = this.state$.pipe(map(state => state.user));
  public readonly isAuthenticated$ = this.state$.pipe(map(state => state.isAuthenticated));
  public readonly isLoading$ = this.state$.pipe(map(state => state.isLoading));
  public readonly error$ = this.state$.pipe(map(state => state.error));
  public readonly token$ = this.state$.pipe(map(state => state.token));

  constructor() {
    this.initializeFromStorage();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeFromStorage(): void {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.updateState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Update the authentication state
   */
  private updateState(updates: Partial<AuthState>): void {
    const currentState = this._state$.value;
    const newState = { ...currentState, ...updates };
    this._state$.next(newState);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateState({ isLoading, error: null });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.updateState({ error, isLoading: false });
  }

  /**
   * Store authentication data
   */
  private setAuth(token: string, user: User): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.updateState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    this.updateState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  /**
   * Make authenticated API request
   */
  private makeAuthRequest(url: string, options: RequestInit = {}): Observable<Response> {
    return this.token$.pipe(
      map(token => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (options.headers) {
          Object.assign(headers, options.headers);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      }),
      switchMap(fetchPromise => {
        return new Observable<Response>(observer => {
          fetchPromise
            .then(response => {
              observer.next(response);
              observer.complete();
            })
            .catch(error => {
              observer.error(error);
            });
        });
      })
    );
  }

  /**
   * User login
   */
  public login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);

    return new Observable<AuthResponse>(observer => {
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message && data.message !== 'Login successful') {
            throw new Error(data.message);
          }
          return data;
        })
        .then(data => {
          this.setAuth(data.token, data.user);
          observer.next(data);
          observer.complete();
        })
        .catch(error => {
          const errorMessage = error.message || 'Login failed';
          this.setError(errorMessage);
          observer.error(new Error(errorMessage));
        });
    });
  }

  /**
   * User signup
   */
  public signup(userData: SignupRequest): Observable<AuthResponse> {
    this.setLoading(true);

    return new Observable<AuthResponse>(observer => {
      fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message && !data.message.includes('successfully')) {
            throw new Error(data.message);
          }
          return data;
        })
        .then(data => {
          this.setAuth(data.token, data.user);
          observer.next(data);
          observer.complete();
        })
        .catch(error => {
          const errorMessage = error.message || 'Signup failed';
          this.setError(errorMessage);
          observer.error(new Error(errorMessage));
        });
    });
  }

  /**
   * User logout
   */
  public logout(): Observable<void> {
    this.setLoading(true);

    return this.token$.pipe(
      switchMap(token => {
        if (!token) {
          this.clearAuth();
          return of(void 0);
        }

        return this.makeAuthRequest(`${API_BASE_URL}/auth/logout`, {
          method: 'GET',
        }).pipe(
          tap(() => this.clearAuth()),
          map(() => void 0),
          catchError(error => {
            console.error('Logout error:', error);
            this.clearAuth();
            return of(void 0);
          })
        );
      })
    );
  }

  /**
   * Validate token with server
   */
  public validateToken(): Observable<boolean> {
    return this.token$.pipe(
      switchMap(token => {
        if (!token) {
          return of(false);
        }

        return this.makeAuthRequest(`${API_BASE_URL}/auth/validate`).pipe(
          map(response => {
            if (!response.ok) {
              this.clearAuth();
              return false;
            }
            return true;
          }),
          catchError(error => {
            console.error('Token validation error:', error);
            this.clearAuth();
            return of(false);
          })
        );
      })
    );
  }

  /**
   * Check if current user is admin
   */
  public isAdmin(): Observable<boolean> {
    return this.user$.pipe(
      map(user => user?.role === 'admin' || false)
    );
  }

  /**
   * Get current state synchronously
   */
  public getCurrentState(): AuthState {
    return this._state$.value;
  }

  /**
   * Get current user synchronously
   */
  public getCurrentUser(): User | null {
    return this._state$.value.user;
  }

  /**
   * Get current token synchronously
   */
  public getCurrentToken(): string | null {
    return this._state$.value.token;
  }

  /**
   * Check if authenticated synchronously
   */
  public isCurrentlyAuthenticated(): boolean {
    return this._state$.value.isAuthenticated;
  }

  /**
   * Check if admin synchronously
   */
  public isCurrentlyAdmin(): boolean {
    return this._state$.value.user?.role === 'admin' || false;
  }

  /**
   * Clear error state
   */
  public clearError(): void {
    this.updateState({ error: null });
  }
}

// Export singleton instance
export const authStore = new AuthStore();
export default authStore; 