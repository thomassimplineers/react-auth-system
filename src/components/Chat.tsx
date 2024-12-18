import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const Chat: React.FC = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      <div className="w-1/3 border-r">
        <ChatList onSelectThread={setSelectedThreadId} />
      </div>
      <div className="w-2/3">
        {selectedThreadId ? (
          <ChatWindow threadId={selectedThreadId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat thread or create a new one
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;