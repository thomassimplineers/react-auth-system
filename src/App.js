import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { MessageSquare, BarChart2, User, LogOut } from 'lucide-react';
import Chat from './components/Chat';
import Statistics from './components/Statistics';
import Profile from './components/Profile';

function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('chat');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        updateUserStatus(session.user.id, true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        updateUserStatus(session.user.id, true);
      }
    });

    // Set up interval to update last_seen
    const interval = setInterval(() => {
      if (session?.user) {
        updateUserStatus(session.user.id, true);
      }
    }, 30000); // Update every 30 seconds

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (session?.user) {
        updateUserStatus(session.user.id, !document.hidden);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (session?.user) {
        updateUserStatus(session.user.id, false);
      }
    };
  }, [session]);

  const updateUserStatus = async (userId, isOnline) => {
    if (!userId) return;

    const { error } = await supabase
      .from('user_status')
      .upsert({
        id: userId,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      });

    if (error) console.error('Error updating user status:', error);
  };

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <Auth
            supabaseClient={supabase}
            theme="dark"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca'
                  }
                }
              }
            }}
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
            className={`inline-flex items-center px-4 py-2 rounded-lg ${currentView === 'chat' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <MessageSquare size={16} className="mr-2" />
            Chat
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${currentView === 'stats' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <BarChart2 size={16} className="mr-2" />
            Statistics
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${currentView === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <User size={16} className="mr-2" />
            Profile
          </button>
        </div>
        <button
          onClick={() => {
            updateUserStatus(session.user.id, false);
            supabase.auth.signOut();
          }}
          className="inline-flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </nav>

      {currentView === 'chat' && <Chat session={session} />}
      {currentView === 'stats' && <Statistics />}
      {currentView === 'profile' && <Profile session={session} />}
    </div>
  );
}

export default App;