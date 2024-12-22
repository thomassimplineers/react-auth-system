import { PostgrestResponse } from '@supabase/supabase-js';
import { FeedEvent } from '../types/feed';
import { supabase } from '../lib/supabaseClient';
import { logFeedOperation } from './feedMetrics';

const RETENTION_DAYS = 90;

export const cleanupOldEvents = async () => {
  const startTime = performance.now();
  try {
    const { data, error } = await supabase
      .from('feed_events')
      .delete()
      .lt('created_at', new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000))
      .select() as PostgrestResponse<FeedEvent[]>;

    const duration = performance.now() - startTime;
    await logFeedOperation('cleanup', duration, 'DELETE', data?.length || 0);

    return data;
  } catch (error) {
    const duration = performance.now() - startTime;
    await logFeedOperation('cleanup_error', duration, 'DELETE', 0);
    throw error;
  }
}; 