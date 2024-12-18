import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

interface ChatListProps {
  onSelectThread: (threadId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectThread }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('chat_threads')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_threads' },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createThread = async () => {
    if (!newThreadTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const now = new Date().toISOString();
      const { error } = await supabase
        .from('chat_threads')
        .insert([
          { 
            title: newThreadTitle.trim(),
            created_by: user.id,
            created_at: now,
            updated_at: now
          }
        ]);

      if (error) throw error;
      
      setNewThreadTitle('');
      fetchThreads();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <input
            type="text"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            placeholder="New thread title..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') createThread();
            }}
          />
          <button
            onClick={createThread}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <h3 className="font-medium">{thread.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(thread.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;