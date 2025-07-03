# ExpenSync Frontend

A modern expense tracking application built with React, TypeScript, PrimeReact, and RxJS for reactive state management.

## Features

- 🔄 **Reactive State Management**
  - RxJS-based authentication store
  - Observable state streams
  - Reactive UI updates
  - Centralized state management

- 🔐 **Authentication System**
  - User registration and login
  - JWT token-based authentication
  - Protected routes with authentication guards
  - Automatic token validation
  - User role management (user/admin)

- 🎨 **Modern UI/UX**
  - Built with PrimeReact components
  - Responsive design
  - Clean and intuitive interface
  - Loading states and error handling

- 🛡️ **Security**
  - Password hashing with bcrypt
  - JWT token management
  - Route protection
  - Input validation

## RxJS State Management

### Architecture Overview

The application uses RxJS for reactive state management with the following components:

1. **AuthStore** (`src/utils/authStore.ts`)
   - Central authentication state management
   - BehaviorSubject for reactive state updates
   - Observable streams for state changes
   - API integration with RxJS operators

2. **useAuthStore Hook** (`src/utils/useAuthStore.ts`)
   - React hook for consuming RxJS store
   - Automatic subscription management
   - Type-safe state access
   - Promise-based API methods

### State Structure

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Observable Streams

- `state$` - Complete authentication state
- `user$` - Current user information
- `isAuthenticated$` - Authentication status
- `isLoading$` - Loading state
- `error$` - Error messages
- `token$` - JWT token

### Usage Example

```typescript
import { useAuthStore } from './utils/useAuthStore';

const MyComponent = () => {
  const { user, isAuthenticated, login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? `Welcome, ${user?.name}!` : 'Please log in'}
    </div>
  );
};
```

## Authentication Flow

### Signup Process
1. User fills out registration form (name, email, password)
2. Frontend validates input
3. RxJS store handles API call with error handling
4. Backend creates user account with hashed password
5. JWT token is generated and stored in reactive state
6. User is automatically logged in and redirected to dashboard

### Login Process
1. User enters email and password
2. RxJS store manages API call and state updates
3. Backend validates credentials
4. JWT token is generated and stored reactively
5. User is redirected to intended page or dashboard

### Route Protection
- All routes except `/login` and `/signup` require authentication
- Unauthenticated users are redirected to login page
- After login, users are redirected to their intended destination
- RxJS store provides real-time authentication state

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Backend server running on `http://localhost:5000`

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── AppLayout.tsx      # Main layout with navigation
│   ├── AuthGuard.tsx      # Route protection component
├── pages/
│   ├── Login.tsx          # Login page
│   ├── Signup.tsx         # Registration page
├── utils/
│   ├── authStore.ts       # RxJS authentication store
│   ├── useAuthStore.ts    # React hook for RxJS store
├── App.tsx                # Main application component
```

## RxJS Benefits

### Reactive Programming
- **Automatic Updates**: UI automatically updates when state changes
- **Stream Processing**: Complex state transformations with RxJS operators
- **Error Handling**: Centralized error management with catchError operator
- **Async Operations**: Elegant handling of API calls and side effects

### Performance
- **Efficient Updates**: Only components that depend on changed state re-render
- **Memory Management**: Automatic subscription cleanup
- **Debouncing**: Built-in support for debouncing user inputs
- **Caching**: Easy implementation of state caching

### Developer Experience
- **Type Safety**: Full TypeScript support
- **Debugging**: Excellent debugging tools with RxJS DevTools
- **Testing**: Easy testing with RxJS testing utilities
- **Predictable State**: Single source of truth for authentication state

## API Endpoints

The frontend communicates with the backend API:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/validate` - Token validation

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Security Features

- **Token Storage**: JWT tokens are stored in localStorage
- **Automatic Logout**: Invalid tokens trigger automatic logout
- **Route Guards**: All protected routes check authentication status
- **Input Validation**: Client-side validation with server-side verification
- **Error Handling**: Comprehensive error messages for users
- **Reactive Security**: Real-time security state monitoring

## RxJS Operators Used

- `BehaviorSubject` - State management with initial value
- `Observable` - Reactive data streams
- `map` - State transformations
- `catchError` - Error handling
- `switchMap` - Cancellable API calls
- `tap` - Side effects
- `of` - Static value streams

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Implement proper error handling with RxJS operators
4. Add comments for complex RxJS operations
5. Test authentication flows thoroughly
6. Use RxJS DevTools for debugging

## Dependencies

- **RxJS**: Reactive programming library
- **React**: UI framework
- **TypeScript**: Type safety
- **PrimeReact**: UI components
- **React Router**: Navigation
