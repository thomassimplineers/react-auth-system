import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import OnlineUsers from './OnlineUsers';

// ... (övriga komponenter som tidigare)

const Chat = () => {
  // ... (state och funktioner som tidigare)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Vänster sidofält med trådar */}
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

      {/* Huvudinnehåll med chat */}
      <div className="flex-1 flex flex-col">
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

      {/* Höger sidofält med online användare */}
      <OnlineUsers userProfiles={userProfiles} />
    </div>
  );
};

export default Chat;