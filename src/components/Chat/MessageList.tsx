import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Message, MessageListProps, MessageData } from './types';
import { supabase } from '../../lib/supabaseClient';
import MessageComponent from './Message';

const MessageList: React.FC<MessageListProps> = ({ thread }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (thread) {
      setMessages([]);
      fetchMessages();

      const channel = supabase
        .channel(`messages-${thread.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages',
            filter: `thread_id=eq.${thread.id}`
          },
          async (payload) => {
            console.log('Message change detected:', payload);
            await fetchMessages();
            scrollToBottom();
          }
        )
        .subscribe((status) => {
          console.log('Message subscription status:', status);
        });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [thread.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      if (!user) {
        console.log('No user found, skipping fetch');
        return;
      }

      setLoading(true);
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          text,
          user_id,
          thread_id,
          created_at,
          profiles!user_id (
            id,
            nickname,
            avatar_url,
            updated_at
          )
        `)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      console.log('=== DEBUG MESSAGES ===');
      console.log('Thread ID:', thread.id);
      console.log('Messages Data:', messagesData);
      console.log('Supabase URL:', process.env.VITE_SUPABASE_URL);
      console.log('=== END DEBUG ===');

      if (error) throw error;
      if (messagesData) {
        const messages = messagesData.map((messageData) => ({
          id: messageData.id,
          text: messageData.text,
          user_id: messageData.user_id,
          thread_id: messageData.thread_id,
          created_at: messageData.created_at,
          profiles: messageData.profiles[0]
        }));
        setMessages(messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          text: messageText,
          user_id: user.id,
          thread_id: thread.id
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-medium">{thread.name}</h2>
        <p className="text-sm text-gray-500">
          Created by {thread.creator?.nickname || 'Anonymous'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <MessageComponent
            key={message.id}
            message={message}
            isOwnMessage={message.user_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageList; 