import React, { useState, useEffect } from 'react';
import { ThreadListProps, Thread, ThreadData } from './types';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import CreateThread from './CreateThread';

const ThreadList: React.FC<ThreadListProps> = ({ threads, selectedThread, onSelectThread, onCreateThread, onDeleteThread }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localThreads, setLocalThreads] = useState<Thread[]>(threads);
  const [showCreateThread, setShowCreateThread] = useState(false);

  const fetchThreads = async () => {
    try {
      if (!user) {
        console.log('No user found, skipping fetch');
        return;
      }

      setLoading(true);
      const { data: threadsData, error } = await supabase
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

      console.log('Fetched threads:', threadsData?.length);

      if (error) throw error;

      if (threadsData) {
        const formattedThreads = threadsData.map((thread: ThreadData) => ({
          id: thread.id,
          name: thread.name,
          created_by: thread.created_by,
          created_at: thread.created_at,
          updated_at: thread.updated_at,
          participants: thread.participants,
          creator: thread.creator,
          messageCount: thread.messages?.[0]?.count || 0
        }));

        setLocalThreads(formattedThreads);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();

    const channel = supabase
      .channel('threads-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'threads' 
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          await fetchThreads(); // Hämta uppdaterad data
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Hjälpfunktion för att formatera trådar
  const formatThread = (thread: ThreadData) => ({
    id: thread.id,
    name: thread.name,
    created_by: thread.created_by,
    created_at: thread.created_at,
    updated_at: thread.updated_at,
    participants: thread.participants,
    creator: thread.creator,
    messageCount: thread.messages?.[0]?.count || 0
  });

  useEffect(() => {
    setLocalThreads(threads);
  }, [threads]);

  const handleCreateThread = async (thread: Omit<Thread, 'id'>) => {
    await onCreateThread(thread);
    setShowCreateThread(false);
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    
    if (!user || !threadId) return;

    if (window.confirm('Are you sure you want to delete this thread?')) {
      try {
        // Optimistisk UI-uppdatering
        setLocalThreads(current => current.filter(thread => thread.id !== threadId));
        
        const { error } = await supabase
          .from('threads')
          .delete()
          .eq('id', threadId)
          .eq('created_by', user.id); // Säkerställ att användaren är skaparen

        if (error) {
          throw error;
        }

        console.log('Thread deleted successfully');
      } catch (error) {
        console.error('Error deleting thread:', error);
        // Om något går fel, hämta den korrekta listan igen
        await fetchThreads();
      }
    }
  };

  return (
    <div className="w-80 bg-white shadow rounded-lg flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="font-medium">Threads</h2>
          <button
            onClick={() => setShowCreateThread(true)}
            className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            New Thread
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading threads...</div>
        ) : localThreads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No threads yet</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {localThreads.map(thread => (
              <li
                key={thread.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedThread?.id === thread.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => onSelectThread(thread)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {thread.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {thread.messageCount} messages
                      </p>
                      {thread.created_by === user?.id && (
                        <button
                          onClick={(e) => handleDeleteThread(e, thread.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Created by {thread.creator?.nickname || 'Unknown'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Updated {new Date(thread.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showCreateThread && (
        <CreateThread
          onCreateThread={handleCreateThread}
          onClose={() => setShowCreateThread(false)}
        />
      )}
    </div>
  );
};

export default ThreadList;