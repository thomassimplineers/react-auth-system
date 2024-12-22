import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import MessageInput from './MessageInput';
import { Thread, Message } from './types';

interface ChatWindowProps {
  thread: Thread | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ thread }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!thread?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            nickname,
            avatar_url
          )
        `)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Prenumerera på nya meddelanden
    const channel = supabase
      .channel(`messages-${thread?.id}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${thread?.id}`
        },
        async () => {
          await fetchMessages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [thread?.id]);

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a thread to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">{thread.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  message.user_id === user?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <p className="text-sm font-semibold">
                  {message.profiles?.nickname || 'Unknown user'}
                </p>
                <p>{message.text}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <MessageInput threadId={thread.id} />
    </div>
  );
};

export default ChatWindow;