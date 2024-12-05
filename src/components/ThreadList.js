import React, { useState } from 'react';

const ThreadList = ({ threads, onSelectThread, currentThreadId }) => {
  return (
    <div className="space-y-2">
      {threads.map(thread => (
        <button
          key={thread.id}
          onClick={() => onSelectThread(thread.id)}
          className={`w-full p-4 rounded-lg text-left transition-all ${currentThreadId === thread.id 
            ? 'bg-blue-50 border-blue-200 shadow-sm' 
            : 'hover:bg-gray-50 border-transparent'} border`}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate pr-4">
              {thread.title}
            </h3>
            <span className="text-xs text-gray-500">
              {new Date(thread.last_message_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            Last message preview here...
          </p>
        </button>
      ))}
    </div>
  );
};

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
        className="w-full p-4 text-left text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        + New Thread
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Thread title"
        className="w-full border-gray-300 rounded-lg mb-2 p-2"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsCreating(false)}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create
        </button>
      </div>
    </form>
  );
};

export { ThreadList, NewThreadButton };