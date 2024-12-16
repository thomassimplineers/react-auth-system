import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Reply, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Chat = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newThread, setNewThread] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchThreads();
      
      const subscription = supabase
        .channel('db-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'threads' }, 
          () => fetchThreads()
        )
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          payload => {
            if (selectedThread?.id === payload.new.thread_id) {
              fetchMessages(selectedThread.id);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedThread, currentUser]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          created_by,
          profiles:created_by (nickname),
          message_count:messages(count)
        `)
        .order('updated_at', { ascending: false });

      if (threadsError) throw threadsError;
      setThreads(threadsData || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (nickname)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createThread = async (e) => {
    e.preventDefault();
    if (!newThread.trim() || loading || !currentUser) return;

    try {
      setLoading(true);
      
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert([{ 
          title: newThread.trim(),
          created_by: currentUser.id
        }])
        .select()
        .single();

      if (threadError) throw threadError;

      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          content: newThread.trim(),
          user_id: currentUser.id,
          thread_id: thread.id
        }]);

      if (messageError) throw messageError;

      setNewThread('');
      fetchThreads();
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || loading || !currentUser) return;

    try {
      setLoading(true);

      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          content: newMessage.trim(),
          user_id: currentUser.id,
          thread_id: selectedThread.id
        }]);

      if (messageError) throw messageError;

      const { error: updateError } = await supabase
        .from('threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedThread.id);

      if (updateError) throw updateError;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const openThread = async (thread) => {
    setSelectedThread(thread);
    await fetchMessages(thread.id);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please log in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full p-4 gap-4">
      {/* Threads List */}
      <div className="w-80 bg-white shadow rounded-lg flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium">Threads</h3>
        </div>
        <div className="flex-grow overflow-y-auto p-2">
          <div className="space-y-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => openThread(thread)}
                className={`p-3 rounded-lg cursor-pointer ${selectedThread?.id === thread.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
              >
                <p className="text-sm font-medium">{thread.title}</p>
                <div className="mt-1 text-xs text-gray-500 flex justify-between">
                  <span>By {thread.profiles?.nickname || 'Anonymous'}</span>
                  <span>{thread.message_count} messages</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {formatTime(thread.updated_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <form onSubmit={createThread} className="space-y-2">
            <input
              type="text"
              placeholder="Start a new thread..."
              value={newThread}
              onChange={(e) => setNewThread(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Thread'}
            </button>
          </form>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white shadow rounded-lg flex flex-col">
        {selectedThread ? (
          <>
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{selectedThread.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Started by {selectedThread.profiles?.nickname || 'Anonymous'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedThread(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-2">
                    <MessageSquare size={16} className="text-gray-400 mt-1" />
                    <div className="flex-grow">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p>{message.content}</p>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>{message.profiles?.nickname || 'Anonymous'}</span>
                        <span>{formatTime(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Send size={16} className="mr-2" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            Select a thread to view messages
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;