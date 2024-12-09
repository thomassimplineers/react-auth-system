import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Table } from '@supabase/ui-react';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('created_at');

      if (error) throw error;

      // Calculate basic statistics
      const stats = {
        totalMessages: data.length,
        messagesPerDay: data.length > 0 ? 
          Math.round(data.length / ((Date.now() - new Date(data[0].created_at).getTime()) / (1000 * 60 * 60 * 24))) : 
          0,
        lastMessageTime: data.length > 0 ? 
          new Date(data[data.length - 1].created_at).toLocaleString() : 
          'No messages'
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading statistics...</div>;

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
        <Table
          data={data}
          columns={columns}
          className="w-full"
        />
      </Card>
    </div>
  );
};

export default Statistics;