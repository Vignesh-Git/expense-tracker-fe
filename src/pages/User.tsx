import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useAuth } from '../utils/useAuth';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';

const UserPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Card style={{ width: 400, padding: '2.5rem 2rem', textAlign: 'center' }}>
          <SkeletonLoader type="form" />
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400, padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>User Profile</div>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>{user.name}</div>
        <div style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: 16 }}>{user.email}</div>
        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.5rem',
          background: user.role === 'admin' ? '#dc2626' : '#059669',
          color: 'white',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginBottom: 24
        }}>{user.role}</div>
        <div style={{ marginTop: 32 }}>
          <Button
            label="Sign Out"
            icon="pi pi-sign-out"
            severity="danger"
            onClick={handleLogout}
            loading={isLoading}
            disabled={isLoading}
            style={{ width: '100%', fontSize: 16, height: 42 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserPage; 