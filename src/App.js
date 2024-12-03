import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Register from './components/Register';
import ChatRoom from './components/ChatRoom';

function App() {
  const [session, setSession] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return isLogin ? 
      <Login onRegisterClick={() => setIsLogin(false)} /> : 
      <Register onLoginClick={() => setIsLogin(true)} />;
  }

  return <ChatRoom session={session} />;
}

export default App;