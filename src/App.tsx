import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Menu from './components/Menu';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PasswordResetForm from './components/auth/PasswordResetForm';
import AuthCallback from './components/auth/AuthCallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLayout from './components/auth/AuthLayout';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Auth routes */}
        <Route 
          path="/auth/login" 
          element={
            <AuthLayout title="Logga in">
              <LoginForm />
            </AuthLayout>
          } 
        />
        <Route 
          path="/auth/register" 
          element={
            <AuthLayout title="Skapa konto">
              <RegisterForm />
            </AuthLayout>
          } 
        />
        <Route 
          path="/auth/reset-password" 
          element={
            <AuthLayout title="Återställ lösenord">
              <PasswordResetForm />
            </AuthLayout>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Main layout component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-100">
    <Menu />
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  </div>
);

export default App;