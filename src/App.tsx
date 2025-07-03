import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import AuthGuard from './components/AuthGuard';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserPage from './pages/User';
import Expenses from './pages/Expenses';

// Page components
const Dashboard = () => (
  <Card title="Dashboard" className="w-full">
    <p className="m-0">
      Welcome to your expense tracking dashboard. Here you can view your financial overview.
    </p>
  </Card>
);

const Settings = () => (
  <Card title="Settings" className="w-full">
    <p className="m-0">
      Configure your account settings and preferences here.
    </p>
  </Card>
);

// Main App component with RxJS-based authentication
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes - authentication required */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/user" element={<UserPage />} />
                  {/* Redirect any unknown routes to dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
