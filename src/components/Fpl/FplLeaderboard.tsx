import { useState } from 'react';
import { useFplData } from '../../hooks/useFplData';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

type LeaderboardType = 'local' | 'global';

export default function FplLeaderboard() {
  const [viewType, setViewType] = useState<LeaderboardType>('local');
  const { loading, error, leagueData } = useFplData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Toggle mellan lokal och global leaderboard */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 px-4 py-3">
          <button
            onClick={() => setViewType('local')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewType === 'local' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kokillvägen League
          </button>
          <button
            onClick={() => setViewType('global')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewType === 'global' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Official FPL League
          </button>
        </nav>
      </div>

      {/* Leaderboard tabell */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team/Manager
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GW Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {viewType === 'local' ? (
              // Visa lokal leaderboard från Supabase
              localLeaderboardData.map((entry, index) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.team_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.manager_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.gameweek_points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.total_points}
                  </td>
                </tr>
              ))
            ) : (
              // Visa global leaderboard från FPL API
              leagueData?.standings.map((entry, index) => (
                <tr key={entry.entry}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.entry_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.player_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.event_total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 