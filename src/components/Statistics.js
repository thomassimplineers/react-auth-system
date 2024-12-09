import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('value');
  const [stats, setStats] = useState({
    ALL: [],
    DEF: [],
    MID: [],
    FWD: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minMinutes: 200,
    maxPrice: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        console.log('Fetching data from Supabase...');
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('value_score', { ascending: false });

        console.log('Received data:', data);
        console.log('Error if any:', error);

        if (error) throw error;

        const filteredData = data?.filter(player => {
          const meetsMinutes = !filters.minMinutes || player.minutes >= filters.minMinutes;
          const meetsPrice = !filters.maxPrice || player.now_cost <= filters.maxPrice * 10;
          return meetsMinutes && meetsPrice;
        }) || [];

        setStats({
          ALL: filteredData,
          DEF: filteredData.filter(p => p.position === 'DEF'),
          MID: filteredData.filter(p => p.position === 'MID'),
          FWD: filteredData.filter(p => p.position === 'FWD')
        });
      } catch (err) {
        console.error('Detailed error:', err);
        setError('Failed to fetch statistics');
      }
      setLoading(false);
    };

    fetchStats();
  }, [filters]); // Re-fetch when filters change

  const handleMinutesChange = (e) => {
    const minutes = parseInt(e.target.value);
    setFilters(prev => ({
      ...prev,
      minMinutes: minutes
    }));
  };

  const handlePriceChange = (e) => {
    const price = e.target.value === 'Any' ? null : parseFloat(e.target.value);
    setFilters(prev => ({
      ...prev,
      maxPrice: price
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800">FPL Statistics</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm mb-4">
        <div className="flex space-x-4 p-4">
          <button
            onClick={() => setActiveTab('value')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'value' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Value Analysis
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'form' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Form Analysis
          </button>
          <button
            onClick={() => setActiveTab('expected')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'expected' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Expected Points
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-lg text-gray-600">Loading statistics...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Best Value Players</h2>
              <div className="space-y-2">
                {stats.ALL.map((player, index) => (
                  <div 
                    key={player.id || index}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">{player.web_name}</span>
                      <span className="text-sm text-gray-500 ml-2">£{(player.now_cost / 10).toFixed(1)}m</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">
                        {player.position}
                      </span>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {player.value_score?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm p-4 border-t">
        <div className="flex space-x-4">
          <select 
            className="rounded-lg border-gray-300 p-2"
            onChange={handleMinutesChange}
            value={filters.minMinutes}
          >
            <option value={200}>Min. Minutes: 200</option>
            <option value={400}>Min. Minutes: 400</option>
            <option value={600}>Min. Minutes: 600</option>
          </select>
          <select 
            className="rounded-lg border-gray-300 p-2"
            onChange={handlePriceChange}
            value={filters.maxPrice || 'Any'}
          >
            <option>Max Price: Any</option>
            <option value="10.0">Max Price: 10.0</option>
            <option value="8.0">Max Price: 8.0</option>
            <option value="6.0">Max Price: 6.0</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Statistics;