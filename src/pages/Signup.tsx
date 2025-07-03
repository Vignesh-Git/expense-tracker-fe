import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../utils/useAuth';

/**
 * Signup Page Component
 * Handles user registration with form validation and error handling
 */
const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    clearError();
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // Error is already handled by the store
      console.error('Signup error:', err);
    }
  };

  /**
   * Get redirect path for login link
   */
  const getLoginRedirectPath = () => {
    const from = location.state?.from?.pathname;
    return from ? `/login?redirect=${encodeURIComponent(from)}` : '/login';
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
          Create Account
        </div>
        
        {/* Error Message */}
        {error && (
          <Message 
            severity="error" 
            text={error} 
            style={{ marginBottom: '1rem' }}
          />
        )}



        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Name Input */}
          <div style={{ width: '100%' }}>
            <span className="p-float-label" style={{ width: '100%' }}>
              <InputText 
                id="name" 
                value={formData.name} 
                onChange={e => handleInputChange('name', e.target.value)}
                className={validationErrors.name ? 'p-invalid' : ''}
                autoFocus 
                style={{ width: '100%' }} 
              />
              <label htmlFor="name">Full Name</label>
            </span>
            {validationErrors.name && (
              <small className="p-error" style={{ display: 'block', marginTop: '0.25rem' }}>
                {validationErrors.name}
              </small>
            )}
          </div>

          {/* Email Input */}
          <div style={{ width: '100%' }}>
            <span className="p-float-label" style={{ width: '100%' }}>
              <InputText 
                id="email" 
                value={formData.email} 
                onChange={e => handleInputChange('email', e.target.value)}
                className={validationErrors.email ? 'p-invalid' : ''}
                style={{ width: '100%' }} 
              />
              <label htmlFor="email">Email Address</label>
            </span>
            {validationErrors.email && (
              <small className="p-error" style={{ display: 'block', marginTop: '0.25rem' }}>
                {validationErrors.email}
              </small>
            )}
          </div>

          {/* Password Input */}
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
                className={validationErrors.password ? 'p-invalid' : ''}
              />
              <label htmlFor="password">Password</label>
            </span>
            {validationErrors.password && (
              <small className="p-error" style={{ display: 'block', marginTop: '0.25rem' }}>
                {validationErrors.password}
              </small>
            )}
          </div>

          {/* Confirm Password Input */}
          <div style={{ width: '100%' }}>
            <span className="p-float-label">
              <Password 
                id="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                feedback={false} 
                toggleMask 
                style={{ width: '100%' }} 
                inputStyle={{ width: '100%' }}
                className={validationErrors.confirmPassword ? 'p-invalid' : ''}
              />
              <label htmlFor="confirmPassword">Confirm Password</label>
            </span>
            {validationErrors.confirmPassword && (
              <small className="p-error" style={{ display: 'block', marginTop: '0.25rem' }}>
                {validationErrors.confirmPassword}
              </small>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            label={isLoading ? "Creating Account..." : "Create Account"} 
            type="submit" 
            className="w-full mt-2" 
            style={{ marginTop: 10, height: 42, fontSize: 16 }}
            loading={isLoading}
            disabled={isLoading}
          />

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span style={{ color: '#6b7280' }}>Already have an account? </span>
            <Link 
              to={getLoginRedirectPath()}
              style={{ 
                color: '#2196f3', 
                textDecoration: 'none', 
                fontWeight: 500 
              }}
            >
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Signup; 