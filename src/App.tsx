import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';

import AuthLayout from './components/auth/AuthLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PasswordResetForm from './components/auth/PasswordResetForm';
import Menu from './components/Menu';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register' | 'reset-password'>('login');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {authView === 'login' && (
          <AuthLayout title="Sign in to your account">
            <LoginForm onRegisterClick={() => setAuthView('register')} />
          </AuthLayout>
        )}
        
        {authView === 'register' && (
          <AuthLayout title="Create your account">
            <RegisterForm onLoginClick={() => setAuthView('login')} />
          </AuthLayout>
        )}
        
        {authView === 'reset-password' && (
          <AuthLayout title="Reset your password">
            <PasswordResetForm onLoginClick={() => setAuthView('login')} />
          </AuthLayout>
        )}
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Menu setCurrentView={setCurrentView} />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'profile' && <Profile />}
        </div>
      </div>
    </Router>
  );
};

export default App;