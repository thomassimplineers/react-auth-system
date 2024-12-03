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
    
    if (error) console.error('Error:', error);
    else setMessages(data || []);
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

    if (error) console.error('Error:', error);
    else setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow">
        <h1 className="text-xl font-bold">Chat Room</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col bg-white rounded-lg p-3 shadow">
            <span className="text-sm text-gray-600">{message.sender}</span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white shadow">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;