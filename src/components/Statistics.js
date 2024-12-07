import React, { useState } from 'react';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('value'); // value, form, expected, security

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'security' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Minutes Security
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Position Cards */}
          {['All', 'DEF', 'MID', 'FWD'].map(position => (
            <div key={position} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">
                {position === 'All' ? 'All Players' : `${position}`}
              </h2>
              {/* Placeholder for player statistics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span>Player Name</span>
                  <span>Score</span>
                </div>
                {/* Add more player rows here */}
              </div>
            </div>
          ))}
        </div>
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