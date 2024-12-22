import { supabase } from '../lib/supabaseClient';

export const logFeedOperation = async (
  operation: string,
  duration: number,
  queryType: string,
  rowsAffected: number
) => {
  try {
    await supabase
      .from('feed_metrics')
      .insert({
        operation,
        duration,
        query_type: queryType,
        rows_affected: rowsAffected
      });
  } catch (error) {
    console.error('Failed to log feed metrics:', error);
  }
}; 