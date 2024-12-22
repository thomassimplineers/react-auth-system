import { Thread, UiThread, ApiThread, Message, UiMessage, ApiMessage } from '../types/thread';

export function mapApiThreadToUi(apiThread: ApiThread): UiThread {
  return {
    id: apiThread.id,
    name: apiThread.name,
    createdBy: apiThread.created_by,
    createdAt: new Date(apiThread.created_at).toISOString(),
    updatedAt: new Date(apiThread.updated_at).toISOString(),
    participants: apiThread.participants,
    lastMessage: apiThread.last_message ? mapApiMessageToUi(apiThread.last_message) : undefined
  };
}

export function mapUiThreadToApi(uiThread: Omit<UiThread, 'id'>): Omit<ApiThread, 'id'> {
  return {
    name: uiThread.name,
    created_by: uiThread.createdBy,
    created_at: new Date(uiThread.createdAt).toISOString(),
    updated_at: new Date(uiThread.updatedAt).toISOString(),
    participants: uiThread.participants,
    last_message: uiThread.lastMessage ? {
      id: 'temp', // Add temporary id to satisfy type
      ...mapUiMessageToApi(uiThread.lastMessage)
    } : undefined
  };
}

export function mapApiMessageToUi(apiMessage: ApiMessage): UiMessage {
  return {
    id: apiMessage.id,
    text: apiMessage.text,
    userId: apiMessage.user_id,
    threadId: apiMessage.thread_id,
    createdAt: apiMessage.created_at,
    user: {
      uid: apiMessage.user.uid,
      email: apiMessage.user.email,
      displayName: apiMessage.user.display_name
    }
  };
}

export function mapUiMessageToApi(uiMessage: Omit<UiMessage, 'id'>): Omit<ApiMessage, 'id'> {
  return {
    text: uiMessage.text,
    user_id: uiMessage.userId,
    thread_id: uiMessage.threadId,
    created_at: uiMessage.createdAt,
    user: {
      uid: uiMessage.user.uid,
      email: uiMessage.user.email,
      display_name: uiMessage.user.displayName
    }
  };
}