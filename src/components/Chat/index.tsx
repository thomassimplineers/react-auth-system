import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Message from './Message';
import ThreadList from './ThreadList';
import { Message as MessageType, Thread } from './types';

interface ThreadMessages {
  [key: string]: MessageType[];
}

const Chat: React.FC = () => {
  const [threadMessages, setThreadMessages] = useState<ThreadMessages>({});
  const [activeThread, setActiveThread] = useState<string>();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  const messages = activeThread ? threadMessages[activeThread] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeThread) return;

    try {
      const message: MessageType = {
        id: Date.now().toString(), // In a real app, this would be handled by the backend
        text: newMessage.trim(),
        user: {
          uid: currentUser.uid || '',
          email: currentUser.email,
          displayName: currentUser.displayName
        },
        timestamp: Date.now()
      };

      setThreadMessages(prev => ({
        ...prev,
        [activeThread]: [...(prev[activeThread] || []), message]
      }));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      <ThreadList 
        activeThread={activeThread} 
        onThreadSelect={setActiveThread}
      />
      {activeThread ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                No messages in this thread yet.
                <br />
                Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <Message key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <p className="text-xl font-semibold">Welcome to Chat!</p>
            <p className="mt-2">Select a thread to start messaging</p>
            <p className="mt-1">or create a new one.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
