import { supabase } from '../../lib/supabase';
import { Thread, Message } from './types';

export async function fetchThreads() {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        profiles:created_by(nickname),
        message_count:messages(count)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
}

export async function createThread(thread: Omit<Thread, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('threads')
      .insert([thread])
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

export async function fetchMessages(threadId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:user_id(nickname)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function sendMessage(message: Omit<Message, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
