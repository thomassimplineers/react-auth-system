import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import ChatMessage from '../Chat/ChatMessage';

interface ThreadProps {
  // ... befintliga props
}

const Thread: React.FC<ThreadProps> = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (threadId) {
      fetchThread();
      fetchMessages();
    }
  }, [threadId]);

  const fetchThread = async () => {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (error) throw error;
      setThread(data);
    } catch (error) {
      console.error('Error fetching thread:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!thread) return <div>Thread not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">{thread.name}</h1>
        </div>

        <div className="divide-y">
          {/* ... message list ... */}
        </div>

        <ChatMessage 
          thread={thread}
          isFirstMessage={messages.length === 0}
          onMessageSent={fetchMessages}
        />
      </div>
    </div>
  );
};

export default Thread; 