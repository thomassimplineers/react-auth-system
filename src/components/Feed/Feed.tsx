import React, { useState, useRef, useCallback, Suspense } from 'react';
import { useFeedContext } from '../../contexts/FeedContext';
import FeedEvent from './FeedEvent';
import FeedFilters from './FeedFilters';
import { EventType } from '../../types/feed';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FeedErrorBoundary } from './FeedErrorBoundary';

interface FeedProps {
  className?: string;
}

const Feed: React.FC<FeedProps> = ({ className = '' }) => {
  const { 
    filteredEvents, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    filterEvents 
  } = useFeedContext();
  
  const [activeFilter, setActiveFilter] = useState<EventType | null>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Infinite scroll handler
  const lastEventRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMore]);

  // Filter handler
  const handleFilterChange = useCallback((type: EventType | null) => {
    setActiveFilter(type);
    filterEvents(type);
  }, [filterEvents]);

  // Error state
  if (error) {
    return (
      <div className={`max-w-3xl mx-auto p-4 ${className}`}>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Det gick inte att ladda aktivitetsflödet</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <FeedErrorBoundary>
      <div className={`max-w-3xl mx-auto p-4 ${className}`}>
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-4 border-b">Feed</h2>
          
          <FeedFilters 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            disabled={loading}
          />

          <div className="divide-y">
            {loading && filteredEvents.length === 0 ? (
              <LoadingState />
            ) : filteredEvents.length === 0 ? (
              <EmptyState activeFilter={activeFilter} />
            ) : (
              <EventList 
                events={filteredEvents}
                loading={loading}
                lastEventRef={lastEventRef}
                {...{events: filteredEvents}} // Pass events prop explicitly
              />
            )}
          </div>
        </div>
      </div>
    </FeedErrorBoundary>
  );
};

// Separate components for better organization
const LoadingState = () => (
  <div 
    className="space-y-4" 
    role="status" 
    aria-label="Loading feed events"
  >
    {[...Array(3)].map((_, i) => (
      <div 
        key={i} 
        className="animate-pulse flex p-4 bg-white rounded-lg shadow"
      >
        <div className="rounded-full bg-gray-200 h-12 w-12" />
        <div className="flex-1 ml-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ activeFilter }: { activeFilter: EventType | null }) => (
  <div className="p-8 text-center">
    <div className="text-gray-400 mb-4">
      <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p className="text-gray-600">Inga aktiviteter att visa</p>
    {activeFilter && (
      <p className="text-sm text-gray-500 mt-2">
        Prova att välja en annan filterinställning
      </p>
    )}
  </div>
);

// Memoizera row renderer
const Row = React.memo(({ index, style, data }: {
  index: number;
  style: React.CSSProperties;
  data: {
    events: FeedEvent[];
    lastEventRef: (node: HTMLDivElement | null) => void;
  };
}) => (
  <div style={style}>
    <FeedEvent 
      event={data.events[index]} 
      ref={index === data.events.length - 1 ? data.lastEventRef : undefined}
    />
  </div>
));

// Uppdatera EventList för att använda Row
const EventList = React.memo(({ 
  events,
  loading, 
  lastEventRef 
}: {
  events: FeedEvent[];
  loading: boolean;
  lastEventRef: (node: HTMLDivElement | null) => void;
}) => {
  const itemData = React.useMemo(() => ({
    events,
    lastEventRef
  }), [events, lastEventRef]);

  return (
    <Suspense fallback={<LoadingState />}>
      <div style={{ height: '600px' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={events.length}
              itemSize={120}
              itemData={itemData}
              overscanCount={5}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </Suspense>
  );
});

export default Feed; 