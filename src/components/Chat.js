import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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
        setMessages(current => [...current, payload.new]);
      })
      .subscribe();

    // Get existing messages
    const getMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };
    getMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('messages').insert({
      content: newMessage,
      user_id: user.id,
      sender: user.email
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl">Chat Room</h1>
      </header>

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
              <p className="text-sm">{message.sender}</p>
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;