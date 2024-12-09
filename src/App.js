import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Statistics from './components/Statistics';

function App() {
  const [session, setSession] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'stats'

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
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
          </div>
        </nav>

        {currentView === 'chat' ? <Chat /> : <Statistics />}
      </div>
    );
  }

  return isLogin ? 
    <Login onRegisterClick={() => setIsLogin(false)} setSession={setSession} /> : 
    <Register onLoginClick={() => setIsLogin(true)} />;
}

export default App;