import React, { createContext, useContext, useState } from 'react';
import { FeedEvent, EventType } from '../types/feed';
import { useFeed } from '../hooks/useFeed';

interface FeedContextType {
  events: FeedEvent[];
  filteredEvents: FeedEvent[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  filterEvents: (type: EventType | null) => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { events, loading, error, hasMore, loadMore, filterEvents } = useFeed();
  console.log('FeedContext state:', { events, loading, error }); // Debug
  return (
    <FeedContext.Provider value={{ 
      events,
      filteredEvents: events,
      loading, 
      error,
      hasMore,
      loadMore,
      filterEvents
    }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within a FeedProvider');
  }
  return context;
}; 