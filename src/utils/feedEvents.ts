import { supabase } from '../lib/supabaseClient';
import { FeedEvent, EventType } from '../types/feed';

export const createFeedEvent = async (
  eventType: EventType,
  actorId: string,
  title: string,
  description: string,
  eventData?: Record<string, any>
) => {
  try {
    const { data, error } = await supabase
      .from('feed_events')
      .insert({
        event_type: eventType,
        actor_id: actorId,
        title,
        description,
        event_data: eventData
      })
      .select(`
        *,
        actor:profiles!actor_id (
          nickname,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating feed event:', error);
    throw error;
  }
};

export const fetchFeedEvents = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('feed_events')
      .select(`
        *,
        actor:profiles!actor_id (
          nickname,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching feed events:', error);
    throw error;
  }
}; 