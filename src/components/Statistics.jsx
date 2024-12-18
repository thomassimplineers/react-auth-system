import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Table } from '@supabase/ui-react';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Prenumerera på uppdateringar
    const subscription = supabase
      .channel('message_stats_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'message_stats' }, 
        payload => {
          // Uppdatera stats när de ändras
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

  if (loading) return <div>Loading statistics...</div>;
  if (!stats) return <div>No statistics available</div>;

  const columns = [
    { Header: 'Metric', accessor: 'metric' },
    { Header: 'Value', accessor: 'value' }
  ];

  const data = [
    { metric: 'Total Messages', value: stats.totalMessages },
    { metric: 'Messages per Day', value: stats.messagesPerDay },
    { metric: 'Last Message', value: stats.lastMessageTime }
  ];

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chat Statistics</h2>
        </div>
        <Table
          data={data}
          columns={columns}
          borderless
          highlightOnHover
          className="w-full"
        />
      </Card>
    </div>
  );
};

export default Statistics;