import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onRegisterClick: () => void;
  setSession: (session: any) => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick, setSession }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          onSuccess={(session) => {
            setSession(session);
          }}
        />
        <div className="text-center">
          <button
            onClick={onRegisterClick}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
