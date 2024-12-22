import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface MessageInputProps {
  threadId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ threadId }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fokusera input när komponenten mountas
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]); // Fokusera om när tråden ändras

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || sending) return;

    try {
      setSending(true);
      
      const newMessage = {
        text: message.trim(),
        thread_id: threadId,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('messages')
        .insert([newMessage]);

      if (error) throw error;

      // Uppdatera även thread.updated_at för att visa senaste aktivitet
      await supabase
        .from('threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

      // Rensa input efter lyckat meddelande
      setMessage('');
      
      // Fokusera input igen för nästa meddelande
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Hantera Enter för att skicka (Shift+Enter för ny rad)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
        >
          {sending ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;