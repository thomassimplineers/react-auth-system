import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovpjenbgvcxehclhztrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cGplbmJndmN4ZWhjbGh6dHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjAxMzEsImV4cCI6MjA0ODc5NjEzMX0.Mk0A3HnzAOgE3IyVH7wAPpnVqsn8QGDaWptz-Ay6qNg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
