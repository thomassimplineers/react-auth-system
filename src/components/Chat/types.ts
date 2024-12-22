// Base types
export interface Thread {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  creator?: {
    nickname?: string;
    avatar_url?: string;
  };
  messageCount?: number;
}

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  updated_at: string;
}

export interface Message {
  id: string;
  text: string;
  thread_id: string;
  user_id: string;
  created_at: string;
  profiles: Profile;
}

// Database response types - exakt matchning med Supabase queries
export interface ThreadData {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  creator?: {
    nickname?: string;
    avatar_url?: string;
  };
  messages: [{ count: number }] | null;
}

export interface MessageData {
  id: string;
  text: string;
  user_id: string;
  thread_id: string;
  created_at: string;
  sender?: {
    nickname?: string;
    avatar_url?: string;
  };
}

// Component Props
export interface CreateThreadProps {
  onCreateThread: (thread: Omit<Thread, 'id'>) => Promise<void>;
  onClose: () => void;
}

export interface ThreadListProps {
  threads: Thread[];
  selectedThread: Thread | null;
  onSelectThread: (thread: Thread) => void;
  onCreateThread: (thread: Omit<Thread, 'id'>) => Promise<void>;
  onDeleteThread?: (threadId: string) => void;
}

export interface MessageListProps {
  thread: Thread;
}

export interface MessageComponentProps {
  message: Message;
  isOwnMessage: boolean;
}

export interface ChatWindowProps {
  thread: Thread | null;
}

export interface MessageInputProps {
  threadId: string;
} 