import React from 'react';
import { Link } from 'react-router-dom';
import { ProfileEvent } from '../../../types/feed';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface ProfileFeedEventProps {
  event: ProfileEvent;
}

export const ProfileFeedEvent: React.FC<ProfileFeedEventProps> = ({ event }) => {
  const { nickname, avatarUrl } = event.event_data;

  return (
    <Link 
      to="/profile"
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
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
          <p className="text-sm text-gray-500">
            {event.description}
          </p>
          <div className="mt-2 flex items-center gap-3">
            {avatarUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Ny profilbild:</span>
                <img 
                  src={avatarUrl} 
                  alt="" 
                  className="h-6 w-6 rounded-full"
                />
              </div>
            )}
            {nickname && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Nytt namn:</span>
                <span className="text-sm font-medium">{nickname}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}; 