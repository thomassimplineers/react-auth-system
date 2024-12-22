import { supabase } from '../lib/supabaseClient';
import { EventType, ChatEventData, FplEventData, ProfileEventData } from '../types/feed';
import { logFeedOperation } from './feedMetrics';

export default class FeedEventHandler {
  private static validateEventData(
    type: EventType, 
    data: ChatEventData | FplEventData | ProfileEventData
  ): boolean {
    switch (type) {
      case 'CHAT':
        const chatData = data as ChatEventData;
        return (
          'thread_id' in chatData &&
          'message_id' in chatData &&
          'message_text' in chatData
        );
      case 'FPL':
        const fplData = data as FplEventData;
        return (
          'score' in fplData ||
          'rank' in fplData ||
          'change' in fplData
        );
      case 'PROFILE':
        const profileData = data as ProfileEventData;
        return (
          'nickname' in profileData ||
          'avatarUrl' in profileData
        );
      default:
        return false;
    }
  }

  static async createEvent(
    type: EventType,
    actorId: string,
    title: string,
    description: string,
    eventData: ChatEventData | FplEventData | ProfileEventData
  ) {
    const startTime = performance.now();
    try {
      if (!this.validateEventData(type, eventData)) {
        throw new Error(`Invalid event data for type ${type}`);
      }

      const { data, error } = await supabase
        .from('feed_events')
        .insert({
          event_type: type,
          actor_id: actorId,
          title,
          description,
          event_data: eventData
        })
        .select(`
          *,
          actor:profiles!actor_id (
            nickname,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const duration = performance.now() - startTime;
      await logFeedOperation('create_event', duration, type, 1);

      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      await logFeedOperation('create_event_error', duration, type, 0);
      throw error;
    }
  }

  static async handleChatMessage(
    userId: string,
    threadId: string,
    messageId: string,
    messageText: string,
    threadName: string
  ) {
    console.log('FeedEventHandler.handleChatMessage called with:', {
      userId, threadId, messageId, messageText, threadName
    });
    
    const startTime = performance.now();
    try {
      const eventData: ChatEventData = {
        thread_id: threadId,
        message_id: messageId,
        message_text: messageText
      };

      const { data, error } = await supabase
        .from('feed_events')
        .insert({
          event_type: 'CHAT',
          actor_id: userId,
          title: `Nytt meddelande i ${threadName}`,
          description: messageText,
          event_data: eventData
        })
        .select(`
          *,
          actor:profiles!actor_id (
            nickname,
            avatar_url
          ),
          thread:threads!feed_events_thread_id_fkey (
            name,
            id
          )
        `)
        .single();

      if (error) throw error;

      const duration = performance.now() - startTime;
      await logFeedOperation('create_chat_event', duration, 'CHAT', 1);

      console.log('Feed event created:', data);
      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      await logFeedOperation('create_chat_event_error', duration, 'CHAT', 0);
      console.error('Failed to create feed event:', error);
      throw error;
    }
  }

  static async handleFplUpdate(
    userId: string,
    score: number,
    rank: number,
    change: number
  ) {
    const eventData: FplEventData = {
      score,
      rank,
      change
    };

    const title = change > 0 ? 'Rank förbättrad!' : 'Rank försämrad';
    const description = `Ny poäng: ${score}, Rank: ${rank} (${change > 0 ? '+' : ''}${change})`;

    return this.createEvent(
      'FPL',
      userId,
      title,
      description,
      eventData
    );
  }

  static async handleProfileUpdate(
    userId: string,
    nickname?: string,
    avatarUrl?: string,
    fplId?: string
  ) {
    const eventData: ProfileEventData = {
      nickname: nickname || null,
      avatarUrl: avatarUrl || null,
      fplId: fplId || null
    };

    const changes: string[] = [];
    if (nickname) changes.push('nickname');
    if (avatarUrl) changes.push('profile picture');
    if (fplId) changes.push('FPL ID');

    return this.createEvent(
      'PROFILE',
      userId,
      'Profile Update',
      `Updated ${changes.join(' and ')}`,
      eventData
    );
  }

  static async createBatchEvents(events: {
    type: EventType;
    actorId: string;
    title: string;
    description: string;
    eventData: ChatEventData | FplEventData | ProfileEventData;
  }[]) {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase
        .from('feed_events')
        .insert(events.map(event => ({
          event_type: event.type,
          actor_id: event.actorId,
          title: event.title,
          description: event.description,
          event_data: event.eventData
        })))
        .select();

      const duration = performance.now() - startTime;
      await logFeedOperation('batch_create', duration, 'BATCH', events.length);

      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      await logFeedOperation('batch_create_error', duration, 'BATCH', 0);
      throw error;
    }
  }
} 