import React from 'react';

const ChatMessage = ({ message, isOwnMessage, avatarUrl, nickname }) => {
  const isImage = message.content.startsWith('![Image]');
  
  return (
    <div className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex flex-col items-center space-y-1">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-sm font-medium">{nickname?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className={`max-w-sm rounded-2xl px-4 py-2 shadow-sm ${isOwnMessage 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
        : 'bg-white border border-gray-200'}`}
      >
        <p className={`text-sm font-medium mb-1 ${isOwnMessage ? 'text-blue-50' : 'text-gray-900'}`}>
          {nickname}
        </p>
        
        {isImage ? (
          <img 
            src={message.content.match(/\((.+)\)/)[1]} 
            alt="Shared" 
            className="rounded-lg max-w-full h-auto mt-2 shadow-sm"
            style={{ maxHeight: '200px' }}
          />
        ) : (
          <p className={`${isOwnMessage ? 'text-white' : 'text-gray-700'}`}>
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;