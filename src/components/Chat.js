import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userNicknames, setUserNicknames] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setUserNicknames(prev => ({
          ...prev,
          [user.id]: profile.nickname
        }));
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        console.log('New message received:', payload);
        setMessages(current => [...current, payload.new]);
        fetchNickname(payload.new.user_id);
      })
      .subscribe();

    const getMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      console.log('Fetched messages:', data);
      setMessages(data || []);

      // Fetch nicknames for all users
      const userIds = [...new Set(data.map(m => m.user_id))];
      userIds.forEach(fetchNickname);
    };
    getMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNickname = async (userId) => {
    if (userNicknames[userId]) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single();

    if (profile) {
      setUserNicknames(prev => ({
        ...prev,
        [userId]: profile.nickname
      }));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setError(null);

    try {
      console.log('Sending message as user:', user);
      const { data, error } = await supabase.from('messages').insert({
        content: newMessage,
        user_id: user.id,
        sender: user.email
      });

      if (error) {
        console.error('Error sending message:', error);
        setError(error.message);
        return;
      }

      console.log('Message sent successfully:', data);
      setNewMessage('');
    } catch (err) {
      console.error('Exception sending message:', err);
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-xs rounded-lg px-4 py-2
              ${message.user_id === user?.id ? 
                'bg-blue-500 text-white' : 
                'bg-gray-200'}
            `}>
              <p className="text-sm font-semibold">
                {userNicknames[message.user_id] || message.sender.split('@')[0]}
              </p>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;