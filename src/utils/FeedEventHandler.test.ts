import { describe, it, expect, beforeEach, vi } from 'vitest';
import FeedEventHandler from './FeedEventHandler';
import { supabase } from '../lib/supabaseClient';
import type { 
  EventType, 
  FeedEventResponse, 
  ChatEventData 
} from '../types/feed';

// Mock måste vara först, före alla andra deklarationer
vi.mock('../lib/supabaseClient', () => {
  const TEST_TIMESTAMP = '2024-12-21T07:51:42.924Z';
  
  return {
    supabase: {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123',
                created_at: TEST_TIMESTAMP,
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
  };
});

// Konstanter efter mock
const TEST_TIMESTAMP = '2024-12-21T07:51:42.924Z';

// Mock Date efter konstanter
const mockDate = vi.spyOn(Date.prototype, 'toISOString');
mockDate.mockReturnValue(TEST_TIMESTAMP);

describe('FeedEventHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleChatMessage', () => {
    it('should create a chat event with correct data', async () => {
      const result = await FeedEventHandler.handleChatMessage(
        'user-123',
        'thread-123',
        'message-123',
        'Hello world',
        'Test Thread'
      );

      expect(result).toEqual({
        id: '123',
        created_at: TEST_TIMESTAMP,
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
      });

      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('feed_events');
      expect(vi.mocked(supabase.from().insert)).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'CHAT',
          actor_id: 'user-123',
          title: 'Nytt meddelande i Test Thread',
          description: 'Hello world',
          event_data: expect.objectContaining({
            thread_id: 'thread-123'
          })
        })
      );
    });
  });

  describe('handleFplUpdate', () => {
    it('should create an FPL event with score and rank data', async () => {
      await FeedEventHandler.handleFplUpdate(
        'user-123',
        100,
        1000,
        5
      );

      expect(vi.mocked(supabase.from().insert)).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'FPL',
          actor_id: 'user-123',
          title: 'Rank förbättrad!',
          description: 'Ny poäng: 100, Rank: 1000 (+5)',
          event_data: {
            score: 100,
            rank: 1000,
            change: 5
          }
        })
      );
    });

    it('should handle negative rank changes', async () => {
      await FeedEventHandler.handleFplUpdate(
        'user-123',
        95,
        1500,
        -10
      );

      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('feed_events');
      expect(vi.mocked(supabase.from('feed_events').insert)).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'FPL',
          actor_id: 'user-123',
          title: 'Rank försämrad',
          description: 'Ny poäng: 95, Rank: 1500 (-10)',
          event_data: {
            score: 95,
            rank: 1500,
            change: -10
          }
        })
      );
    });
  });

  describe('handleProfileUpdate', () => {
    it('should create a profile event with nickname update', async () => {
      await FeedEventHandler.handleProfileUpdate(
        'user-123',
        'NewNick'
      );

      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('feed_events');
      expect(vi.mocked(supabase.from('feed_events').insert)).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'PROFILE',
          actor_id: 'user-123',
          event_data: {
            nickname: 'NewNick'
          }
        })
      );
    });
  });
});