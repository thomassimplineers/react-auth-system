import { createClient } from '@supabase/supabase-js';
import { FeedEvent } from '../types/feed';
import { supabase } from '../lib/supabaseClient';

const CACHE_TTL = 5 * 60 * 1000; // 5 minuter
const cache = new Map<string, { data: FeedEvent[]; timestamp: number }>();

export const getCachedFeedEvents = async (
  userId: string,
  page: number,
  pageSize: number
) => {
  const cacheKey = `feed_${userId}_${page}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Om ingen cache, hämta från databasen
  const { data } = await supabase
    .from('feed_events')
    .select('*')
    .eq('actor_id', userId)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (data) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  return data;
}; 