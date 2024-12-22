import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFeedEvent } from './feedEvents';
import type { 
  EventType, 
  FeedEventResponse, 
  ChatEventData, 
  FplEventData, 
  ProfileEventData 
} from '../types/feed';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '123',
              created_at: new Date().toISOString(),
              actor_id: 'test-user-id',
              event_type: 'CHAT',
              title: 'Test Event',
              description: 'Test Description',
              event_data: {
                thread_id: 'test-thread-id',
                message_id: 'test-message-id',
                message_text: 'Test message'
              },
              actor: {
                nickname: 'Test User',
                avatar_url: null
              }
            },
            error: null
          })
        })
      })
    })
  }
}));

describe('Feed Events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFeedEvent', () => {
    describe('successful event creation', () => {
      it('should create a chat event with correct data', async () => {
        const chatData: ChatEventData = {
          thread_id: 'test-thread-id',
          message_id: 'test-message-id',
          message_text: 'Test message'
        };

        const event = await createFeedEvent(
          'CHAT',
          'test-user-id',
          'New chat message',
          'Test message content',
          chatData
        );

        expect(event).toEqual(expect.objectContaining({
          event_type: 'CHAT',
          actor_id: 'test-user-id',
          title: 'New chat message',
          description: 'Test message content',
          event_data: expect.objectContaining(chatData)
        }));
      });

      // ... resten av testerna ...
    });
  });
}); 