// Base domain types
export interface Thread {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  last_message?: Message;
}

export interface Message {
  id: string;
  text: string;
  user_id: string;
  thread_id: string;
  created_at: string;
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

// UI-specific types (camelCase)
export interface UiThread extends Omit<Thread, 'created_by' | 'created_at' | 'updated_at' | 'last_message'> {
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: UiMessage;
  creator?: {
    nickname: string;
    avatarUrl?: string;
  };
  messageCount?: number;
}

export interface UiMessage extends Omit<Message, 'user_id' | 'thread_id' | 'created_at'> {
  userId: string;
  threadId: string;
  createdAt: string;
}

// API-specific types (snake_case)
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
  text: string;
  user_id: string;
  thread_id: string;
  created_at: string;
  user: {
    uid: string;
    email: string;
    display_name?: string;
  };
}

// Component Props
export interface ThreadListProps {
  activeThread?: string;
  onThreadSelect?: (threadId: string) => void;
}

export interface ChatMessageProps {
  message: Message;
} 