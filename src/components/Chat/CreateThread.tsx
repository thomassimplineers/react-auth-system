import React, { useState } from 'react';
import { Thread } from './types';
import { supabase } from '../../lib/supabaseClient';

interface CreateThreadProps {
  onCreateThread: (thread: Omit<Thread, 'id'>) => void;
  onClose: () => void;
}

const CreateThread: React.FC<CreateThreadProps> = ({ onCreateThread, onClose }) => {
  const [threadName, setThreadName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const now = new Date().toISOString();
      onCreateThread({
        name: threadName.trim(),
        created_by: user.id,
        created_at: now,
        updated_at: now,
        participants: [user.id]
      });
      
      setThreadName('');
      onClose();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Thread</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="threadName" className="block text-sm font-medium text-gray-700">
              Thread Name
            </label>
            <input
              type="text"
              id="threadName"
              value={threadName}
              onChange={(e) => setThreadName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter thread name"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThread;