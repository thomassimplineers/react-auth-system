import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Menu from './components/Menu';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PasswordResetForm from './components/auth/PasswordResetForm';
import AuthCallback from './components/auth/AuthCallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Auth routes */}
        <Route path="/auth/login" element={<AuthLayout><LoginForm /></AuthLayout>} />
        <Route path="/auth/register" element={<AuthLayout><RegisterForm /></AuthLayout>} />
        <Route path="/auth/reset-password" element={<AuthLayout><PasswordResetForm /></AuthLayout>} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Layout components
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full">
      {children}
    </div>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-100">
    <Menu />
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  </div>
);

export default App;