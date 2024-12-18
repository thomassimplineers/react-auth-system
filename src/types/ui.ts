export interface UiThread {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: string[];
  lastMessage?: UiMessage;
}

export interface UiMessage {
  id: string;
  threadId: string;
  userId: string;
  text: string;
  createdAt: string;
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

export interface UiProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

export interface ThreadListProps {
  activeThread?: string;
  onThreadSelect?: (threadId: string) => void;
}

export interface ChatMessageProps {
  message: UiMessage;
}