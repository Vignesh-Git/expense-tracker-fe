import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuthStore } from '../utils/useAuthStore';

// Props interface for the layout component
interface AppLayoutProps {
  children: React.ReactNode;
}

// Navigation component with permanent sidenav
const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      url: '/',
    },
    {
      label: 'Expenses',
      icon: 'pi pi-dollar',
      url: '/expenses',
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      url: '/settings',
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <nav
      style={{
        width: 240,
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1rem 2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: '2rem', fontWeight: 700, fontSize: 22, color: '#222' }}>
        ExpenseSync
      </div>
      
      {/* User Info Section */}
      {user && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          background: '#f8fafc', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            {user.email}
          </div>
          <div style={{ 
            display: 'inline-block', 
            padding: '0.25rem 0.5rem', 
            background: user.role === 'admin' ? '#dc2626' : '#059669', 
            color: 'white', 
            borderRadius: '4px', 
            fontSize: '0.75rem', 
            fontWeight: 500 
          }}>
            {user.role}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.url}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 500,
              color: location.pathname === item.url ? '#fff' : '#374151',
              background: location.pathname === item.url ? '#2196f3' : 'transparent',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          severity="secondary"
          text
          onClick={handleLogout}
          loading={isLoading}
          disabled={isLoading}
          style={{ width: '100%', justifyContent: 'flex-start' }}
        />
      </div>
    </nav>
  );
};

// Main AppLayout component
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Navigation />
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  );
};

export default AppLayout; 