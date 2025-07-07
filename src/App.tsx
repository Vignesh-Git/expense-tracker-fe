import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserPage from './pages/User';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import AdminExpenseRequests from './pages/AdminExpenseRequests';
import useAuth from './utils/useAuth';

// Route guard for admin-only routes
const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};



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
                  <Route path="/admin/approvals" element={
                    <AdminOnlyRoute>
                      <AdminExpenseRequests />
                    </AdminOnlyRoute>
                  } />
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
