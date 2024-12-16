import React, { useState } from 'react';
import { ThreadListProps, Thread } from './types';
import CreateThread from './CreateThread';

const ThreadList: React.FC<ThreadListProps> = ({ activeThread, onThreadSelect }) => {
  const [threads, setThreads] = useState<Thread[]>([]); // In a real app, this would be managed by a context or state management
  const [showCreateThread, setShowCreateThread] = useState(false);

  const handleCreateThread = (newThread: Omit<Thread, 'id'>) => {
    const thread: Thread = {
      ...newThread,
      id: Date.now().toString(), // In a real app, this would be handled by the backend
    };
    setThreads([...threads, thread]);
    onThreadSelect?.(thread.id);
  };

  return (
    <>
      <div className="w-64 bg-white border-r overflow-y-auto flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Conversations</h2>
          <button
            onClick={() => setShowCreateThread(true)}
            className="p-1 rounded-full hover:bg-gray-100"
            title="Create new thread"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet.
              <br />
              Start by creating a new thread!
            </div>
          ) : (
            <div className="space-y-1">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onThreadSelect?.(thread.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 ${activeThread === thread.id ? 'bg-gray-100' : ''}`}
                >
                  <div className="font-medium">{thread.name}</div>
                  {thread.lastMessage && (
                    <div className="text-sm text-gray-500 truncate">{thread.lastMessage.text}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showCreateThread && (
        <CreateThread
          onCreateThread={handleCreateThread}
          onClose={() => setShowCreateThread(false)}
        />
      )}
    </>
  );
};

export default ThreadList;
