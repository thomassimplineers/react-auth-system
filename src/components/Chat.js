import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ChatMessage = ({ message, isOwnMessage, avatarUrl, nickname }) => (
  <div className={`flex items-start gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-white text-sm">{nickname?.[0]?.toUpperCase()}</span>
      )}
    </div>
    <div className={`
      max-w-xs rounded-lg px-4 py-2
      ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'}
    `}>
      <p className="text-sm font-semibold">{nickname}</p>
      <p>{message.content}</p>
    </div>
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchUserProfile(user.id);
    };
    getUser();
  }, []);

  const fetchUserProfile = async (userId) => {
    if (userProfiles[userId]) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('id', userId)
      .single();

    if (profile) {
      setUserProfiles(prev => ({
        ...prev,
        [userId]: profile
      }));
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        setMessages(current => [...current, payload.new]);
        fetchUserProfile(payload.new.user_id);
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
      setMessages(data || []);

      // Fetch profiles for all users
      const userIds = [...new Set(data.map(m => m.user_id))];
      userIds.forEach(fetchUserProfile);
    };
    getMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setError(null);

    try {
      const { error } = await supabase.from('messages').insert({
        content: newMessage,
        user_id: user.id,
        sender: user.email
      });

      if (error) {
        setError(error.message);
        return;
      }

      setNewMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwnMessage={message.user_id === user?.id}
            avatarUrl={userProfiles[message.user_id]?.avatar_url}
            nickname={userProfiles[message.user_id]?.nickname || message.sender.split('@')[0]}
          />
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