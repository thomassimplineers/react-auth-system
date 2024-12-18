// API types that match Supabase's snake_case convention
export interface ApiThread {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  last_message?: ApiMessage;
}

export interface ApiMessage {
  id: string;
  thread_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user: {
    uid: string;
    email: string;
    display_name?: string;
  };
}

export interface ApiProfile {
  id: string;
  nickname: string;
  avatar_url?: string;
}