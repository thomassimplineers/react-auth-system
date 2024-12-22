import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  thread_id: string;
  user: {
    nickname: string;
    avatar_url: string | null;
  };
}

const Thread: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threadInfo, setThreadInfo] = useState<{ name: string; topic?: string } | null>(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        if (!threadId) return;

        const { data: thread, error: threadError } = await supabase
          .from('threads')
          .select('name, topic')
          .eq('id', threadId)
          .single();

        if (threadError) throw threadError;
        setThreadInfo(thread);

        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            user:profiles!messages_user_id_fkey (
              nickname,
              avatar_url
            )
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messages || []);
      } catch (err) {
        console.error('Error fetching thread:', err);
        setError('Failed to load thread');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [threadId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !threadInfo) {
    return <div className="text-red-600">{error || 'Thread not found'}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">{threadInfo.name}</h2>
          {threadInfo.topic && (
            <p className="text-gray-600 text-sm mt-1">{threadInfo.topic}</p>
          )}
        </div>

        <div className="divide-y">
          {messages.map((message) => (
            <div key={message.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{message.user.nickname}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t">
          <ChatMessage 
            thread={threadInfo}
            onMessageSent={() => {
              // Uppdatera meddelanden efter att ett nytt skickats
              window.location.reload();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Thread; 