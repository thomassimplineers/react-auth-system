import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel('public-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        setMessages(current => [...current, payload.new]);
      })
      .subscribe();

    // Fetch existing messages
    fetchMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) console.error('Error fetching messages:', error);
    else setMessages(data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('messages')
      .insert([{
        content: newMessage,
        user_id: user.id,
        sender: user.email
      }]);

    if (error) console.error('Error sending message:', error);
    else setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.user_id === supabase.auth.user()?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${message.user_id === supabase.auth.user()?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <div className="text-sm font-semibold">{message.sender}</div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 p-2"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;