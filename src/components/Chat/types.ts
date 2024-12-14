export interface Message {
  id?: string;
  text: string;
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
  timestamp?: number;
}

export interface Thread {
  id: string;
  name: string;
  lastMessage?: Message;
  participants: string[];
}

export interface ChatMessageProps {
  message: Message;
}

export interface ThreadListProps {
  activeThread?: string;
  onThreadSelect?: (threadId: string) => void;
}
