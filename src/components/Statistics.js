import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/value-picks');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch statistics');
        setStats({
          ALL: data,
          // We'll add position filtering later
        });
      } catch (err) {
        setError('Failed to fetch statistics');
        console.error('Error fetching stats:', err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

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
                    key={index}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">{player.web_name}</span>
                      <span className="text-sm text-gray-500 ml-2">£{(player.now_cost / 10).toFixed(1)}m</span>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {player.value_score.toFixed(2)}
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
          <select className="rounded-lg border-gray-300 p-2">
            <option>Min. Minutes: 200</option>
            <option>Min. Minutes: 400</option>
            <option>Min. Minutes: 600</option>
          </select>
          <select className="rounded-lg border-gray-300 p-2">
            <option>Max Price: Any</option>
            <option>Max Price: 10.0</option>
            <option>Max Price: 8.0</option>
            <option>Max Price: 6.0</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Statistics;