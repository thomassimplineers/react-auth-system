import React from 'react';
import { Link } from 'react-router-dom';
import { ChatEvent } from '../../../types/feed';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface ChatFeedEventProps {
  event: ChatEvent;
}

export const ChatFeedEvent: React.FC<ChatFeedEventProps> = ({ event }) => {
  return (
    <Link 
      to={`/thread/${event.event_data.thread_id}`}
      className="block hover:bg-gray-50 transition-colors duration-150"
    >
      <div className="flex items-center space-x-3 p-4 border rounded-lg">
        <div className="flex-shrink-0">
          {event.actor.avatar_url ? (
            <img 
              src={event.actor.avatar_url} 
              alt=""
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {event.actor.nickname}
            </p>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(event.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {event.event_data.message_text}
          </p>
          {event.thread && (
            <p className="mt-1 text-xs text-gray-400">
              i {event.thread.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}; 