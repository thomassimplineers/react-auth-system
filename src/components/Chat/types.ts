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
  thread_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

export interface Profile {
  id: string;
  nickname: string;
  avatar_url?: string;
}

export interface ThreadListProps {
  activeThread?: string;
  onThreadSelect?: (threadId: string) => void;
}

export interface ChatMessageProps {
  message: Message;
}
