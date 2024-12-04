import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import OnlineUsers from './OnlineUsers';
import { ThreadList, NewThreadButton } from './ThreadList';
import ChatMessage from './ChatMessage';

const Header = () => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">ChatApp</h1>
      <button 
        onClick={() => supabase.auth.signOut()}
        className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-all"
      >
        Sign Out
      </button>
    </div>
  </div>
);

const ChatInput = ({ onSubmit, onImageUpload, newMessage, setNewMessage, isLoading, disabled }) => (
  <form onSubmit={onSubmit} className="p-4 bg-gray-50 border-t border-gray-200">
    <div className="flex items-center gap-3 max-w-4xl mx-auto bg-white p-2 rounded-lg shadow-sm">
      <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          disabled={isLoading || disabled}
          className="hidden"
        />
        📎
      </label>
      <input
        type="text"
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        placeholder={disabled ? "Select a thread to start chatting" : "Type a message..."}
        disabled={disabled}
        className="flex-1 px-4 py-2 border-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-all"
      />
      <button 
        type="submit"
        disabled={disabled}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  </form>
);

const Sidebar = ({ children, title }) => (
  <div className="w-80 bg-white shadow-lg overflow-hidden border-r border-gray-200">
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="p-4 overflow-y-auto h-full">{children}</div>
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

  // ... resten av dina useEffects och funktioner ...

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar title="Conversations">
          <div className="space-y-4">
            <NewThreadButton onCreate={handleCreateThread} />
            <ThreadList 
              threads={threads}
              onSelectThread={setCurrentThreadId}
              currentThreadId={currentThreadId}
            />
          </div>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-white shadow-xl rounded-lg m-4 overflow-hidden">
          {currentThread && (
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{currentThread.title}</h2>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
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

          <ChatInput 
            onSubmit={handleSend}
            onImageUpload={handleImageUpload}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isLoading={uploadingImage}
            disabled={!currentThreadId}
          />
        </main>

        <Sidebar title="Online Users">
          <OnlineUsers userProfiles={userProfiles} />
        </Sidebar>
      </div>
    </div>
  );
};

export default Chat;