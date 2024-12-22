import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { FeedEvent, EventType } from '../types/feed';
import { debounce } from 'lodash';
import type { DebouncedFunc } from 'lodash'; // Add type import for debounce

const ITEMS_PER_PAGE = 10;

interface FeedState {
  events: FeedEvent[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  activeFilter: EventType | null;
}

type FeedAction = 
  | { type: 'fetchEvents'; payload: { events: FeedEvent[]; hasMore: boolean; page: number } }
  | { type: 'fetchEventsError'; payload: { error: string } }
  | { type: 'setLoading'; payload: boolean }
  | { type: 'loadMore' }
  | { type: 'filterEvents'; payload: { activeFilter: EventType | null } }
  | { type: 'refreshEvents' };

const feedReducer = (state: FeedState, action: FeedAction): FeedState => {
  switch (action.type) {
    case 'setLoading':
      return {
        ...state,
        loading: action.payload,
        error: null
      };
    case 'fetchEvents':
      return {
        ...state,
        events: action.payload.events,
        loading: false,
        error: null,
        hasMore: action.payload.hasMore,
        page: action.payload.page
      };
    case 'fetchEventsError':
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case 'loadMore':
      return {
        ...state,
        loading: true
      };
    case 'filterEvents':
      return {
        ...state,
        page: 0,
        activeFilter: action.payload.activeFilter
      };
    case 'refreshEvents':
      return {
        ...state,
        page: 0,
        loading: true,
        error: null
      };
    default:
      return state;
  }
};

// Lägg till en utility funktion för att hantera duplicerade events
const mergeEvents = (oldEvents: FeedEvent[], newEvents: FeedEvent[]): FeedEvent[] => {
  const eventMap = new Map(oldEvents.map(event => [event.id, event]));
  newEvents.forEach(event => eventMap.set(event.id, event));
  return Array.from(eventMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const useFeed = () => {
  const [feedState, dispatch] = useReducer(feedReducer, {
    events: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 0,
    activeFilter: null
  });
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchEvents = useCallback(async (pageNumber: number) => {
    try {
      dispatch({ type: 'setLoading', payload: true });
      
      if (pageNumber < 0) {
        throw new Error('Invalid page number');
      }

      const from = pageNumber * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const query = supabase
        .from('feed_events')
        .select(`
          *,
          actor:profiles!feed_events_actor_id_fkey (
            id,
            nickname,
            avatar_url
          )
        `)
        .match(feedState.activeFilter ? { event_type: feedState.activeFilter } : {})
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log('Executing query:', { pageNumber, from, to, filter: feedState.activeFilter });
      
      const { data: eventsWithUsers, error } = await query;

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to fetch events: ${error.message}`);
      }

      if (!eventsWithUsers) {
        console.warn('No events received');
        throw new Error('No data received from database');
      }

      console.log(`Received ${eventsWithUsers.length} events`);

      const transformedData = eventsWithUsers.map(event => ({
        ...event,
        actor: {
          nickname: event.actor?.nickname || event.actor?.email?.split('@')[0] || 'Unknown User',
          avatar_url: event.actor?.avatar_url || null
        }
      }));

      dispatch({ 
        type: 'fetchEvents', 
        payload: { 
          events: pageNumber === 0 ? transformedData : [...feedState.events, ...transformedData],
          hasMore: eventsWithUsers.length === ITEMS_PER_PAGE,
          page: pageNumber 
        } 
      });
    } catch (err) {
      console.error('Error in fetchEvents:', err);
      dispatch({ 
        type: 'fetchEventsError', 
        payload: { 
          error: err instanceof Error 
            ? err.message 
            : 'Unknown error occurred while fetching events'
        } 
      });
    }
  }, [feedState.activeFilter, feedState.events]);

  const setupRealtimeSubscription = useCallback(() => {
    let pendingUpdates: FeedEvent[] = [];
    let updateTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const processUpdates = () => {
      if (pendingUpdates.length > 0) {
        dispatch({ 
          type: 'fetchEvents', 
          payload: { 
            events: mergeEvents(feedState.events, pendingUpdates),
            hasMore: true,
            page: feedState.page
          } 
        });
        pendingUpdates = [];
      }
    };

    const handleRealtimeEvent = async (payload: any) => {
      try {
        const { data: newEvent } = await supabase
          .from('feed_events')
          .select(`
            *,
            actor:profiles!feed_events_actor_id_fkey (
              id,
              nickname,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (newEvent) {
          const transformedEvent = {
            ...newEvent,
            actor: {
              nickname: newEvent.actor?.nickname || 'Unknown User',
              avatar_url: newEvent.actor?.avatar_url || null
            }
          };

          if (!feedState.activeFilter || transformedEvent.event_type === feedState.activeFilter) {
            pendingUpdates.push(transformedEvent);
            
            if (updateTimeout) {
              clearTimeout(updateTimeout);
            }
            updateTimeout = setTimeout(processUpdates, 500);
          }
        }
      } catch (err) {
        console.error('Error handling realtime event:', err);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(() => handleRealtimeEvent(payload), 1000 * retryCount);
        }
      }
    };

    const setupChannel = () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }

      channelRef.current = supabase
        .channel('feed_events_realtime')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'feed_events' },
          handleRealtimeEvent
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          if (status === 'SUBSCRIBED') {
            retryCount = 0;  // Reset retry count on successful connection
          }
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              setTimeout(setupChannel, 1000 * retryCount);
            }
          }
        });
    };

    setupChannel();

    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [feedState.activeFilter, feedState.events, feedState.page]);

  useEffect(() => {
    fetchEvents(0);
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [fetchEvents, setupRealtimeSubscription]);

  const loadMore = useCallback(async () => {
    if (!feedState.loading && feedState.hasMore) {
      const nextPage = feedState.page + 1;
      dispatch({ type: 'loadMore' });
      await fetchEvents(nextPage);
    }
  }, [feedState.loading, feedState.hasMore, feedState.page, fetchEvents]);

  const filterEvents = useCallback((type: EventType | null) => {
    dispatch({ type: 'filterEvents', payload: { activeFilter: type } });
  }, []);

  // Batcha uppdateringar med debounce
  const debouncedUpdate = useCallback(
    debounce((newEvents: FeedEvent[]) => {
      dispatch({ 
        type: 'fetchEvents', 
        payload: { 
          events: newEvents,
          hasMore: true,
          page: feedState.page 
        } 
      });
    }, 500),
    [feedState.page]
  );

  return {
    events: feedState.events,
    loading: feedState.loading,
    error: feedState.error,
    hasMore: feedState.hasMore,
    loadMore,
    filterEvents,
    refreshEvents: () => fetchEvents(0)
  };
}; 