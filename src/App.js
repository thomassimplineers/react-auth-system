import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from '@supabase/ui-react';
import { Button, IconButton } from '@supabase/ui-react';
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
          <Auth.UserContextProvider supabaseClient={supabase}>
            <Auth 
              supabaseClient={supabase}
              providers={['google', 'github']}
              appearance={{
                theme: 'light',
                variables: {
                  default: {
                    colors: {
                      brand: '#404040',
                      brandAccent: '#52525b'
                    }
                  }
                }
              }}
            />
          </Auth.UserContextProvider>
        </div>
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <Button
            onClick={() => setCurrentView('chat')}
            type={currentView === 'chat' ? 'primary' : 'default'}
            size="small"
          >
            Chat
          </Button>
          <Button
            onClick={() => setCurrentView('stats')}
            type={currentView === 'stats' ? 'primary' : 'default'}
            size="small"
          >
            Statistics
          </Button>
          <Button
            onClick={() => setCurrentView('profile')}
            type={currentView === 'profile' ? 'primary' : 'default'}
            size="small"
          >
            Profile
          </Button>
        </div>
        <Button
          onClick={() => supabase.auth.signOut()}
          type="danger"
          size="small"
        >
          Sign Out
        </Button>
      </nav>

      {currentView === 'chat' && <Chat />}
      {currentView === 'stats' && <Statistics />}
      {currentView === 'profile' && <Profile session={session} />}
    </div>
  );
}

export default App;