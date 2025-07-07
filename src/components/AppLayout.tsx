import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import ExpenseSyncLogo from '../assets/ExpenseSync.logo.png'; // Import logo

// Props interface for the layout component
interface AppLayoutProps {
  children: React.ReactNode;
}

// Navigation component with permanent sidenav
const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      url: '/',
    },
    ...(user && user.role === 'admin'
      ? [{ label: 'Approvals', icon: 'pi pi-check-square', url: '/admin/approvals' }]
      : [{ label: 'Expenses', icon: 'pi pi-dollar', url: '/expenses' }]),
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      url: '/settings',
    }
  ];

  return (
    <nav
      style={{
        width: 240,
        height: '100vh',
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1rem 2rem 1rem',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Logo at the top of the sidenav */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
        <img
          src={ExpenseSyncLogo}
          alt="ExpenSync Logo"
          style={{ width: '100%', height: 'auto', marginBottom: 8 }}
        />
        
      </div>
      
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

      {/* User Profile Card at the bottom, clickable to /user */}
      {user && (
        <div
          onClick={() => navigate('/user')}
          style={{
            marginTop: 16,
            marginBottom: 8,
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            boxShadow: location.pathname === '/user' ? '0 0 0 2px #2196f3' : 'none',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>{user.name}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>{user.email}</div>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            background: user.role === 'admin' ? '#dc2626' : '#059669',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>{user.role}</div>
        </div>
      )}

      {/* Logout Button removed */}
    </nav>
  );
};

// Main AppLayout component
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Navigation />
      <main style={{ flex: 1, marginLeft: 240 }}>{children}</main>
    </div>
  );
};

export default AppLayout; 