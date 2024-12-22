export type EventType = 'CHAT' | 'FPL' | 'PROFILE';

// Base Event Interface
export interface BaseEvent {
  id: string;
  created_at: string;
  actor_id: string;
  event_type: EventType;
  title: string;
  description: string;
}

// Chat Event Data
export interface ChatEventData {
  thread_id: string;
  message_id: string;
  message_text: string;
  topic?: string;
}

// FPL Event Data
export interface FplEventData {
  score?: number;
  rank?: number;
  change?: number;
  gameweek?: number;
  team_name?: string;
}

// Profile Event Data
export interface ProfileEventData {
  nickname?: string;
  avatarUrl?: string;
  previous_nickname?: string;
  previous_avatarUrl?: string;
}

// Event Interfaces with Specific Data
export interface ChatEvent extends BaseEvent {
  event_type: 'CHAT';
  event_data: ChatEventData;
  actor: {
    nickname: string;
    avatar_url: string | null;
  };
  thread?: {
    name: string;
    id: string;
  };
}

export interface FplEvent extends BaseEvent {
  event_type: 'FPL';
  event_data: FplEventData;
  actor: {
    nickname: string;
    avatar_url: string | null;
  };
}

export interface ProfileEvent extends BaseEvent {
  event_type: 'PROFILE';
  event_data: ProfileEventData;
  actor: {
    nickname: string;
    avatar_url: string | null;
  };
}

// Union Type for All Events
export type FeedEvent = ChatEvent | FplEvent | ProfileEvent;

// Type Guard Functions
export const isChatEvent = (event: FeedEvent): event is ChatEvent => {
  return event.event_type === 'CHAT';
};

export const isFplEvent = (event: FeedEvent): event is FplEvent => {
  return event.event_type === 'FPL';
};

export const isProfileEvent = (event: FeedEvent): event is ProfileEvent => {
  return event.event_type === 'PROFILE';
};

// Database Response Types
export interface FeedEventResponse {
  id: string;
  created_at: string;
  actor_id: string;
  event_type: EventType;
  title: string;
  description: string;
  event_data: ChatEventData | FplEventData | ProfileEventData;
  actor: {
    nickname: string;
    avatar_url: string | null;
  };
} 