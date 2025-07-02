import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuthStore } from '../utils/useAuthStore';

// Props interface for the guard component
interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Authentication Guard Component
 * Protects routes by checking authentication status using RxJS store
 * Redirects unauthenticated users to login page
 * Optionally checks for admin role
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role if required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default AuthGuard; 