import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../utils/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Basic validation
    if (!formData.email || !formData.password) {
      return; // Error will be set by the store
    }

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      });

      // Redirect to home page after successful login
      navigate('/', { replace: true });
    } catch (err: unknown) {
      // Error is already handled by the store
      console.error('Login error:', err);
    }
  };

  const getSignupRedirectPath = () => {
    const from = location.state?.from?.pathname;
    return from ? `/signup?redirect=${encodeURIComponent(from)}` : '/signup';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      padding: '1rem'
    }}>
      <Card style={{ width: 400, padding: '2.5rem 2rem' }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 28, textAlign: 'center' }}>
          Login to ExpenseSync
        </div>
        
        {error && (
          <Message severity="error" text={error} style={{ marginBottom: '1rem' }} />
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ width: '100%' }}>
            <span className="p-float-label" style={{ width: '100%' }}>
              <InputText 
                id="email" 
                value={formData.email} 
                onChange={e => handleInputChange('email', e.target.value)}
                autoFocus 
                style={{ width: '100%' }} 
              />
              <label htmlFor="email">Email Address</label>
            </span>
          </div>
          
          <div style={{ width: '100%' }}>
            <span className="p-float-label">
              <Password 
                id="password" 
                value={formData.password} 
                onChange={e => handleInputChange('password', e.target.value)}
                feedback={false} 
                toggleMask 
                style={{ width: '100%' }} 
                inputStyle={{ width: '100%' }} 
              />
              <label htmlFor="password">Password</label>
            </span>
          </div>
          
          <Button 
            label={isLoading ? "Signing In..." : "Sign In"} 
            type="submit" 
            className="w-full mt-2" 
            style={{ marginTop: 10, height: 42, fontSize: 16 }}
            loading={isLoading}
            disabled={isLoading}
          />

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span style={{ color: '#6b7280' }}>Don't have an account? </span>
            <Link 
              to={getSignupRedirectPath()}
              style={{ color: '#2196f3', textDecoration: 'none', fontWeight: 500 }}
            >
              Sign up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login; 