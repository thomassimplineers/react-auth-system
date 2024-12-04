import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ThreadList = ({ threads, onSelectThread, currentThreadId }) => (
  <div className="space-y-2">
    {threads.map(thread => (
      <button
        key={thread.id}
        onClick={() => onSelectThread(thread.id)}
        className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 ${currentThreadId === thread.id ? 'bg-blue-50' : ''}`}
      >
        <h3 className="font-medium">{thread.title}</h3>
        <p className="text-sm text-gray-500">
          {new Date(thread.last_message_at).toLocaleDateString()}
        </p>
      </button>
    ))}
  </div>
);

const NewThreadButton = ({ onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title);
    setTitle('');
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="w-full text-left p-3 text-blue-600 hover:bg-gray-50 rounded-lg"
      >
        + New Thread
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-2">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Thread title"
        className="w-full border rounded p-2"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setIsCreating(false)}
          className="text-gray-600 px-3 py-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const ChatMessage = ({ message, isOwnMessage, avatarUrl, nickname }) => (
  <div className={`flex items-start gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-white text-sm">{nickname?.[0]?.toUpperCase()}</span>
      )}
    </div>
    <div className={`max-w-sm rounded-lg px-4 py-2 ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
      <p className="text-sm font-semibold">{nickname}</p>
      {message.content.startsWith('![Image]') ? (
        <img 
          src={message.content.match(/\((.+)\)/)[1]} 
          alt="Shared" 
          className="mt-2 rounded-lg max-w-full h-auto"
          style={{ maxHeight: '200px' }}
        />
      ) : (
        <p>{message.content}</p>
      )}
    </div>
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchUserProfile(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('threads')
        .select('*')
        .order('last_message_at', { ascending: false });
      setThreads(data || []);
      if (data?.length > 0 && !currentThreadId) {
        setCurrentThreadId(data[0].id);
      }
    };
    fetchThreads();

    const channel = supabase
      .channel('threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, fetchThreads)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentThreadId]);

  useEffect(() => {
    if (!currentThreadId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', currentThreadId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      const userIds = [...new Set(data?.map(m => m.user_id) || [])];
      userIds.forEach(fetchUserProfile);
    };

    fetchMessages();

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${currentThreadId}`,
      }, payload => {
        setMessages(current => [...current, payload.new]);
        fetchUserProfile(payload.new.user_id);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentThreadId]);

  const fetchUserProfile = async (userId) => {
    if (userProfiles[userId]) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('id', userId)
      .single();

    if (profile) {
      setUserProfiles(prev => ({
        ...prev,
        [userId]: profile
      }));
    }
  };

  const handleCreateThread = async (title) => {
    const { data, error } = await supabase
      .from('threads')
      .insert({
        title,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setCurrentThreadId(data.id);
  };

  const handleImageUpload = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `chat-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      await supabase.from('messages').insert({
        content: `![Image](${publicUrl})`,
        user_id: user.id,
        sender: user.email,
        thread_id: currentThreadId
      });

      await supabase
        .from('threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentThreadId);

    } catch (error) {
      setError(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentThreadId) return;
    setError(null);

    try {
      const { error: messageError } = await supabase.from('messages').insert({
        content: newMessage,
        user_id: user.id,
        sender: user.email,
        thread_id: currentThreadId
      });

      if (messageError) throw messageError;

      const { error: threadError } = await supabase
        .from('threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentThreadId);

      if (threadError) throw threadError;

      setNewMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  const currentThread = threads.find(t => t.id === currentThreadId);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg p-4 hidden lg:block overflow-y-auto">
        <div className="space-y-4">
          <NewThreadButton onCreate={handleCreateThread} />
          <ThreadList 
            threads={threads}
            onSelectThread={setCurrentThreadId}
            currentThreadId={currentThreadId}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto">
        {currentThread && (
          <div className="bg-white shadow-sm p-4 border-b">
            <h2 className="text-lg font-semibold">{currentThread.title}</h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.user_id === user?.id}
              avatarUrl={userProfiles[message.user_id]?.avatar_url}
              nickname={userProfiles[message.user_id]?.nickname || message.sender.split('@')[0]}
            />
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t">
          <div className="flex items-center gap-2">
            <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage || !currentThreadId}
                className="hidden"
              />
              📎
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={currentThreadId ? "Type a message..." : "Select a thread to start chatting"}
              disabled={!currentThreadId}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button 
              type="submit"
              disabled={!currentThreadId}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="w-64 bg-white shadow-lg p-4 hidden lg:block overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Media Gallery</h2>
        <div className="grid grid-cols-2 gap-2">
          {messages
            .filter(m => m.content.startsWith('![Image]'))
            .map(message => (
              <img 
                key={message.id}
                src={message.content.match(/\((.+)\)/)[1]}
                alt=""
                className="w-full h-24 object-cover rounded"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;