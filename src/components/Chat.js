import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

const SidePanel = ({ title, children }) => (
  <div className="w-64 bg-white shadow-lg p-4 hidden lg:block">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState([]);
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
        sender: user.email
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        setMessages(current => [...current, payload.new]);
        fetchUserProfile(payload.new.user_id);
      })
      .subscribe();

    const getMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      setMessages(data || []);
      const userIds = [...new Set(data.map(m => m.user_id))];
      userIds.forEach(fetchUserProfile);
    };
    getMessages();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setError(null);

    try {
      const { error } = await supabase.from('messages').insert({
        content: newMessage,
        user_id: user.id,
        sender: user.email
      });

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidePanel title="Online Users">
        <div className="space-y-2">
          {Object.entries(userProfiles).map(([userId, profile]) => (
            <div key={userId} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white">{profile.nickname?.[0]}</span>
                )}
              </div>
              <span>{profile.nickname}</span>
            </div>
          ))}
        </div>
      </SidePanel>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto">
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
                disabled={uploadingImage}
                className="hidden"
              />
              📎
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <SidePanel title="Media Gallery">
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
      </SidePanel>
    </div>
  );
};

export default Chat;