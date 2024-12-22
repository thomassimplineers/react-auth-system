import React from 'react';
import { Link } from 'react-router-dom';
import { FplEvent } from '../../../types/feed';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface FplFeedEventProps {
  event: FplEvent;
}

export const FplFeedEvent: React.FC<FplFeedEventProps> = ({ event }) => {
  const { score, rank, change } = event.event_data;
  const isPositiveChange = change && change > 0;

  return (
    <Link 
      to="/fpl"
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
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
          <div className="mt-1 flex items-center gap-3">
            {score !== undefined && (
              <span className="text-sm text-gray-600">
                Poäng: {score}
              </span>
            )}
            {rank !== undefined && (
              <span className="text-sm text-gray-600">
                Rank: {rank.toLocaleString()}
              </span>
            )}
            {change !== undefined && (
              <span className={`text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {isPositiveChange ? '↑' : '↓'} {Math.abs(change)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {event.description}
          </p>
        </div>
      </div>
    </Link>
  );
}; 