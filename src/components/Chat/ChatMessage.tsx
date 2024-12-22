import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import FeedEventHandler from '../../utils/FeedEventHandler';
import { ChatEventData } from '../../types/feed';

interface ChatMessageProps {
  thread: {
    id: string;
    name: string;
    topic?: string;
  };
  isNewThread?: boolean;
  isFirstMessage?: boolean;
  onMessageSent?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  thread, 
  isNewThread = false,
  isFirstMessage = false,
  onMessageSent 
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      setLoading(true);
      console.log('Starting to send message...'); // Debug

      // 1. Spara meddelandet
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([{
          text: messageText,
          user_id: user.id,
          thread_id: thread.id,
          topic: thread.topic || thread.name,
          extension: 'text'
        }])
        .select()  // Viktigt! Vi behöver message.id
        .single();

      console.log('Message created:', message); // Debug

      if (messageError) throw messageError;

      // 2. Skapa feed event
      console.log('Creating feed event for message:', message.id);
      const feedEvent = await FeedEventHandler.handleChatMessage(
        user.id,
        thread.id,
        message.id,  // Här är message.id viktigt
        messageText,
        thread.name
      );
      console.log('Feed event created:', feedEvent);

      // 3. Notifiera parent
      onMessageSent?.();

    } catch (error) {
      console.error('Full error:', error);
      setNewMessage(messageText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSendMessage} 
      className="p-4 bg-white border-t"
      aria-label="Message form"
    >
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv ett meddelande..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Send message"
        >
          {loading ? 'Skickar...' : 'Skicka'}
        </button>
      </div>
    </form>
  );
};

export default ChatMessage; 