import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ... (tidigare komponenter oförändrade)

const OnlineUsers = ({ userProfiles }) => (
  <div className="w-64 bg-white shadow-lg p-4 hidden lg:block">
    <h2 className="text-lg font-semibold mb-4">Online Users</h2>
    <div className="space-y-2">
      {Object.entries(userProfiles).map(([userId, profile]) => (
        <div key={userId} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white">{profile.nickname?.[0]}</span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-sm font-medium">{profile.nickname}</span>
        </div>
      ))}
    </div>
  </div>
);

const Chat = () => {
  // ... (tidigare state och useEffect oförändrade)

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

      <OnlineUsers userProfiles={userProfiles} />
    </div>
  );
};

export default Chat;