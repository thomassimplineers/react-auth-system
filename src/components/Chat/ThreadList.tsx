import React from 'react';
import { ThreadListProps, Thread } from './types';

const ThreadList: React.FC<ThreadListProps> = ({ activeThread, onThreadSelect }) => {
  const threads: Thread[] = []; // Replace with actual thread data

  return (
    <div className="w-64 bg-white border-r overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversations</h2>
      </div>
      <div className="space-y-1">
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onThreadSelect?.(thread.id)}
            className={`w-full p-3 text-left hover:bg-gray-50 ${
              activeThread === thread.id ? 'bg-gray-100' : ''
            }`}
          >
            <div className="font-medium">{thread.name}</div>
            {thread.lastMessage && (
              <div className="text-sm text-gray-500 truncate">
                {thread.lastMessage.text}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThreadList;
