import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel('messages')
      .on('INSERT', payload => {
        setMessages(current => [...current, payload.new]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching messages:', error);
    else setMessages(data || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ content: newMessage }]);

    if (error) console.error('Error sending message:', error);
    else setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-grow overflow-y-auto mb-4 bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <MessageSquare size={20} className="text-gray-500" />
              <div className="bg-gray-100 rounded-lg p-3 flex-grow">
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={sendMessage} className="flex space-x-2">
        <input
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Send size={16} className="mr-2" />
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;