import React from 'react';
import { MessageComponentProps } from './types';
import { useSupabaseImage } from '../../hooks/useSupabaseImage';

const Message: React.FC<MessageComponentProps> = ({ message, isOwnMessage }) => {
  const avatarUrl = useSupabaseImage(message.profiles?.avatar_url);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {message.profiles?.nickname?.[0] || 'A'}
              </span>
            </div>
          )}
        </div>
      )}
      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg px-4 py-2`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {message.profiles?.nickname || 'Anonymous'}
          </span>
          <span className="text-xs opacity-75">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm">{message.text}</p>
      </div>
      {isOwnMessage && (
        <div className="flex-shrink-0 ml-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {message.profiles?.nickname?.[0] || 'A'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Message;
