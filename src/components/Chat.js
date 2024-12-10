import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Reply, X, Circle } from 'lucide-react';

const Chat = ({ session }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();

    // Subscribe to messages
    const messageSubscription = supabase
      .channel('messages')
      .on('INSERT', payload => {
        if (!payload.new.thread_id) {
          setMessages(current => [...current, payload.new]);
        } else if (selectedThread && payload.new.thread_id === selectedThread.id) {
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

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .is('thread_id', null)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching messages:', error);
    else setMessages(data || []);
  };

  const fetchOnlineUsers = async () => {
    const { data, error } = await supabase
      .from('user_status')
      .select(`
        id,
        is_online,
        last_seen,
        profiles:id (username)
      `)
      .eq('is_online', true);

    if (error) console.error('Error fetching online users:', error);
    else setOnlineUsers(data || []);
  };

  const fetchThreadMessages = async (threadId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching thread messages:', error);
    else setThreadMessages(data || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ content: newMessage, user_id: session.user.id }]);

    if (error) console.error('Error sending message:', error);
    else setNewMessage('');
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedThread) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ 
        content: replyContent,
        thread_id: selectedThread.id,
        user_id: session.user.id
      }]);

    if (error) console.error('Error sending reply:', error);
    else setReplyContent('');
  };

  const openThread = async (message) => {
    setSelectedThread(message);
    await fetchThreadMessages(message.id);
  };

  const closeThread = () => {
    setSelectedThread(null);
    setThreadMessages([]);
    setReplyContent('');
  };

  return (
    <div className="flex h-full p-4 gap-4">
      <div className="flex-1 flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4 bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start space-x-2">
                  <MessageSquare size={20} className="text-gray-500" />
                  <div className="flex-grow">
                    <div 
                      className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200"
                      onClick={() => openThread(message)}
                    >
                      <p>{message.content}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => openThread(message)}
                  className="ml-8 mt-1 text-sm text-gray-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Reply size={14} />
                  Reply
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Start a new thread..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Send size={16} className="mr-2" />
            Send
          </button>
        </form>
      </div>

      {selectedThread && (
        <div className="w-96 flex flex-col bg-white shadow rounded-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Thread</h3>
            <button 
              onClick={closeThread}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p>{selectedThread.content}</p>
            </div>
            
            <div className="space-y-4 mt-4">
              {threadMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-2">
                  <MessageSquare size={16} className="text-gray-500" />
                  <div className="bg-gray-100 rounded-lg p-3 flex-grow">
                    <p>{message.content}</p>
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
        </div>
      )}

      <div className="w-64 bg-white shadow rounded-lg p-4">
        <h3 className="font-medium mb-4">Online Users</h3>
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <Circle size={8} className="text-green-500 fill-current" />
              <span>{user.profiles?.username || 'Anonymous User'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;