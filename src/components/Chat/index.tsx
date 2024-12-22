import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ThreadList from './ThreadList';
import ChatWindow from './ChatWindow';
import { Thread } from './types';
import { useAuth } from '../../contexts/AuthContext';

const Chat: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Hämta trådar
  const fetchThreads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          creator:profiles!created_by (
            nickname,
            avatar_url
          ),
          messages (
            count
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setThreads(data);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Skapa ny tråd
  const handleCreateThread = async (threadData: Omit<Thread, 'id'>) => {
    try {
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('threads')
        .insert([{
          name: threadData.name,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          participants: [user.id]
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setThreads(current => [data, ...current]);
        setSelectedThread(data);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  };

  // Hämta trådar när komponenten laddas
  useEffect(() => {
    fetchThreads();

    // Prenumerera på tråd-uppdateringar
    const channel = supabase
      .channel('threads-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'threads' 
        },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return (
    <div className="flex h-screen">
      <ThreadList
        threads={threads}
        selectedThread={selectedThread}
        onSelectThread={setSelectedThread}
        onCreateThread={handleCreateThread}
      />
      <ChatWindow thread={selectedThread} />
    </div>
  );
};

export default Chat;