-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create threads table first (since messages references it)
CREATE TABLE IF NOT EXISTS threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT threads_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  nickname TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create messages table last (since it references both threads and users)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  thread_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

-- Create message_stats view
CREATE OR REPLACE VIEW message_stats AS
SELECT 
  COUNT(*) as total_messages,
  COUNT(*)::float / GREATEST(EXTRACT(EPOCH FROM (NOW() - MIN(created_at)))/86400, 1) as messages_per_day,
  MAX(created_at) as last_message_time
FROM messages;

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Messages are viewable by everyone"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  USING (true);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Threads are viewable by everyone"
  ON threads FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create threads"
  ON threads FOR INSERT
  USING (true);

CREATE POLICY "Thread creators can update their threads"
  ON threads FOR UPDATE
  USING (auth.uid() = created_by);

-- Create functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url, updated_at)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'nickname', new.email), null, now());
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 