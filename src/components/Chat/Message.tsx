import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessageProps } from './types';

const Message: React.FC<ChatMessageProps> = ({ message }) => {
  const { currentUser } = useAuth();
  const isOwnMessage = message.user.uid === currentUser?.uid;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
          isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-white border'
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1">{message.user.email}</div>
        )}
        <div>{message.text}</div>
      </div>
    </div>
  );
};

export default Message;
