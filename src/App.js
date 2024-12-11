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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hämta initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Lyssna på auth ändringar
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Skapa/uppdatera profil vid inloggning
        await supabase
          .from('profiles')
          .upsert({ 
            id: session.user.id,
            nickname: session.user.email.split('@')[0],
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
          </div>
          <Auth
            supabaseClient={supabase}
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
  }

  const handleSignOut = async () => {
    // Uppdatera online status innan utloggning
    await supabase
      .from('user_status')
      .upsert({
        id: session.user.id,
        is_online: false,
        last_seen: new Date().toISOString()
      });

    await supabase.auth.signOut();
  };

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
          onClick={handleSignOut}
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