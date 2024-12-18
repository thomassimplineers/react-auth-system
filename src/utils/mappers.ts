import { ApiThread, ApiMessage, ApiProfile } from '../types/api';
import { UiThread, UiMessage, UiProfile } from '../types/ui';

export function mapApiThreadToUi(apiThread: ApiThread): UiThread {
  return {
    id: apiThread.id,
    name: apiThread.name,
    createdBy: apiThread.created_by,
    createdAt: apiThread.created_at,
    updatedAt: apiThread.updated_at,
    participants: apiThread.participants,
    lastMessage: apiThread.last_message ? mapApiMessageToUi(apiThread.last_message) : undefined
  };
}

export function mapApiMessageToUi(apiMessage: ApiMessage): UiMessage {
  return {
    id: apiMessage.id,
    threadId: apiMessage.thread_id,
    userId: apiMessage.user_id,
    text: apiMessage.text,
    createdAt: apiMessage.created_at,
    user: {
      uid: apiMessage.user.uid,
      email: apiMessage.user.email,
      displayName: apiMessage.user.display_name
    }
  };
}

export function mapApiProfileToUi(apiProfile: ApiProfile): UiProfile {
  return {
    id: apiProfile.id,
    nickname: apiProfile.nickname,
    avatarUrl: apiProfile.avatar_url
  };
}

// Mapping back to API format when sending data
export function mapUiThreadToApi(uiThread: Omit<UiThread, 'id'>): Omit<ApiThread, 'id'> {
  return {
    name: uiThread.name,
    created_by: uiThread.createdBy,
    created_at: uiThread.createdAt,
    updated_at: uiThread.updatedAt,
    participants: uiThread.participants,
    last_message: uiThread.lastMessage ? mapUiMessageToApi(uiThread.lastMessage) : undefined
  };
}

export function mapUiMessageToApi(uiMessage: Omit<UiMessage, 'id'>): Omit<ApiMessage, 'id'> {
  return {
    thread_id: uiMessage.threadId,
    user_id: uiMessage.userId,
    text: uiMessage.text,
    created_at: uiMessage.createdAt,
    user: {
      uid: uiMessage.user.uid,
      email: uiMessage.user.email,
      display_name: uiMessage.user.displayName
    }
  };
}