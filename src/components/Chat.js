import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import OnlineUsers from './OnlineUsers';

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

const Sidebar = ({ children, title }) => (
  <div className="w-80 bg-white shadow-lg overflow-hidden border-r border-gray-200">
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="p-4 overflow-y-auto h-full">{children}</div>
  </div>
);

const Chat = () => {
  // ... existing state and effects

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

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

          <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button 
                type="submit"
                disabled={!currentThreadId}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </main>

        <Sidebar title="Online Users">
          <OnlineUsers userProfiles={userProfiles} />
        </Sidebar>
      </div>
    </div>
  );
};

export default Chat;