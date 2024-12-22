import React, { Suspense, lazy } from 'react';
import { FeedEvent as FeedEventType, isChatEvent, isFplEvent, isProfileEvent } from '../../types/feed';

// Lazy load event komponenter
const ChatFeedEvent = lazy(() => import('./FeedEventTypes/ChatFeedEvent').then(module => ({ default: module.ChatFeedEvent })));
const FplFeedEvent = lazy(() => import('./FeedEventTypes/FplFeedEvent').then(module => ({ default: module.FplFeedEvent })));
const ProfileFeedEvent = lazy(() => import('./FeedEventTypes/ProfileFeedEvent').then(module => ({ default: module.ProfileFeedEvent })));

// Fallback loading component
const EventSkeleton = () => (
  <div className="animate-pulse p-4 flex space-x-4">
    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

interface FeedEventProps {
  event: FeedEventType;
}

const FeedEvent: React.FC<FeedEventProps> = ({ event }) => {
  const actorName = event.actor?.nickname || 'Unknown User';

  // Använd type guards för att rendera rätt komponent
  if (isChatEvent(event)) {
    return (
      <Suspense fallback={<EventSkeleton />}>
        <ChatFeedEvent event={event} />
      </Suspense>
    );
  }

  if (isFplEvent(event)) {
    return (
      <Suspense fallback={<EventSkeleton />}>
        <FplFeedEvent event={event} />
      </Suspense>
    );
  }

  if (isProfileEvent(event)) {
    return (
      <Suspense fallback={<EventSkeleton />}>
        <ProfileFeedEvent event={event} />
      </Suspense>
    );
  }

  // Fallback för okända event typer
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <p className="text-gray-500">Okänd händelsetyp</p>
    </div>
  );
};

export default FeedEvent;
