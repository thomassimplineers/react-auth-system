import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Input, Button, IconSend, IconMessage } from '@supabase/ui-react';

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
      <Card className="flex-grow overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <IconMessage />
              <div className="bg-gray-100 rounded-lg p-3">
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <form onSubmit={sendMessage} className="flex space-x-2">
        <Input
          className="flex-grow"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button
          type="primary"
          htmlType="submit"
          icon={<IconSend />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;