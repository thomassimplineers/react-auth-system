import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Profile from './components/Profile';

function App() {
  const [session, setSession] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState('chat');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return (
      <div className="h-screen flex flex-col">
        <nav className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button 
                onClick={() => setCurrentView('chat')}
                className={`px-3 py-1 rounded ${currentView === 'chat' ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
              >
                Chat
              </button>
              <button 
                onClick={() => setCurrentView('profile')}
                className={`px-3 py-1 rounded ${currentView === 'profile' ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
              >
                Profile
              </button>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </nav>
        {currentView === 'chat' ? <Chat /> : <Profile />}
      </div>
    );
  }

  return isLogin ? 
    <Login onRegisterClick={() => setIsLogin(false)} /> : 
    <Register onLoginClick={() => setIsLogin(true)} />;
}

export default App;