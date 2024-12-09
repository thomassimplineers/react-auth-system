import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Chat from './components/Chat';
import Statistics from './components/Statistics';
import Profile from './components/Profile';

function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('chat');

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

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
          />
        </div>
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('chat')}
            className={`px-4 py-2 rounded-lg ${currentView === 'chat' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            className={`px-4 py-2 rounded-lg ${currentView === 'stats' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            Statistics
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`px-4 py-2 rounded-lg ${currentView === 'profile' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            Profile
          </button>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-50"
        >
          Sign Out
        </button>
      </nav>

      {currentView === 'chat' && <Chat />}
      {currentView === 'stats' && <Statistics />}
      {currentView === 'profile' && <Profile session={session} />}
    </div>
  );
}

export default App;