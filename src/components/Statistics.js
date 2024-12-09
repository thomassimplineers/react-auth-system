import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart2 } from 'lucide-react';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    const subscription = supabase
      .channel('message_stats_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'message_stats' }, 
        payload => {
          if (payload.new) {
            setStats({
              totalMessages: payload.new.total_messages,
              messagesPerDay: parseFloat(payload.new.messages_per_day).toFixed(2),
              lastMessageTime: new Date(payload.new.last_message_time).toLocaleString()
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_stats')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setStats({
          totalMessages: data.total_messages,
          messagesPerDay: parseFloat(data.messages_per_day).toFixed(2),
          lastMessageTime: new Date(data.last_message_time).toLocaleString()
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center">
          Loading statistics...
        </div>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center">
          No statistics available
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 size={24} />
          <h2 className="text-xl font-bold">Chat Statistics</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="font-medium">Total Messages</div>
            <div>{stats.totalMessages}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="font-medium">Messages per Day</div>
            <div>{stats.messagesPerDay}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="font-medium">Last Message</div>
            <div>{stats.lastMessageTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;