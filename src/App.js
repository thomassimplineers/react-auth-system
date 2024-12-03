import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Profile from './components/Profile';
import NavMenu from './components/Menu';

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

  const renderView = () => {
    switch(currentView) {
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile />;
      case 'stats':
        return <div className="p-4">Statistics Coming Soon</div>;
      default:
        return <Chat />;
    }
  };

  if (session) {
    return (
      <div className="h-screen flex flex-col">
        <nav className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <NavMenu setCurrentView={setCurrentView} />
            <button 
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </nav>
        {renderView()}
      </div>
    );
  }

  return isLogin ? 
    <Login onRegisterClick={() => setIsLogin(false)} /> : 
    <Register onLoginClick={() => setIsLogin(true)} />;
}

export default App;