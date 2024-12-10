import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Reply, X, Circle, Plus } from 'lucide-react';

const Chat = ({ session }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchThreads();
    fetchOnlineUsers();

    // Subscribe to messages and threads
    const messageSubscription = supabase
      .channel('messages')
      .on('INSERT', payload => {
        if (selectedThread && payload.new.thread_id === selectedThread.id) {
          setThreadMessages(current => [...current, payload.new]);
        }
      })
      .subscribe();

    // Subscribe to online status changes
    const presenceSubscription = supabase
      .channel('online-users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_status' }, 
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      presenceSubscription.unsubscribe();
    };
  }, [selectedThread]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .is('thread_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to fetch threads');
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url');

      if (profilesError) throw profilesError;

      const { data: status, error: statusError } = await supabase
        .from('user_status')
        .select('*')
        .eq('is_online', true);

      if (statusError) throw statusError;

      const onlineUsersWithProfiles = status.map(user => {
        const profile = profiles.find(p => p.id === user.id);
        return {
          ...user,
          nickname: profile?.nickname || 'Anonymous User'
        };
      });

      setOnlineUsers(onlineUsersWithProfiles);
      setError(null);
    } catch (err) {
      console.error('Error fetching online users:', err);
      setError('Failed to fetch online users');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        user_id: session.user.id,
        sender: userProfile?.nickname || 'Anonymous'
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;
      
      setNewMessage('');
      setThreads(current => [data, ...current]);
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedThread) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ 
          content: replyContent,
          thread_id: selectedThread.id,
          user_id: session.user.id,
          sender: userProfile?.nickname || 'Anonymous'
        }]);

      if (error) throw error;
      
      setReplyContent('');
      setError(null);
      // Uppdatera trådens meddelanden
      fetchThreadMessages(selectedThread.id);
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply');
    }
  };

  const fetchThreadMessages = async (threadId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setThreadMessages(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching thread messages:', err);
      setError('Failed to load thread messages');
    }
  };

  const openThread = async (thread) => {
    setSelectedThread(thread);
    await fetchThreadMessages(thread.id);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
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
                <p className="text-sm line-clamp-2">{thread.content}</p>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>{thread.sender}</span>
                  <span>{formatTimestamp(thread.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex flex-col space-y-2">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Start a new thread..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus size={16} className="mr-2" />
              New Thread
            </button>
          </form>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white shadow rounded-lg">
        {selectedThread ? (
          <>
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Thread</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Started by {selectedThread.sender} - {formatTimestamp(selectedThread.created_at)}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedThread(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p>{selectedThread.content}</p>
              </div>
              
              <div className="space-y-4 mt-4">
                {threadMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-2">
                    <MessageSquare size={16} className="text-gray-500 mt-1" />
                    <div className="flex-grow">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p>{message.content}</p>
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>{message.sender}</span>
                        <span>{formatTimestamp(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={sendReply} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Reply to thread..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Reply size={16} className="mr-2" />
                  Reply
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

      {/* Online Users */}
      <div className="w-64 bg-white shadow rounded-lg p-4">
        <h3 className="font-medium mb-4">Online Users</h3>
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <Circle size={8} className="text-green-500 fill-current" />
              <span>{user.nickname}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;