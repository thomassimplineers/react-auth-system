import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Menu from './components/Menu';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PasswordResetForm from './components/auth/PasswordResetForm';
import { Session } from '@supabase/supabase-js';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {authView === 'login' && (
            <LoginForm 
              onRegisterClick={() => setAuthView('register')}
              onForgotPasswordClick={() => setAuthView('reset-password')}
            />
          )}
          
          {authView === 'register' && (
            <RegisterForm onLoginClick={() => setAuthView('login')} />
          )}
          
          {authView === 'reset-password' && (
            <PasswordResetForm onLoginClick={() => setAuthView('login')} />
          )}
        </div>
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