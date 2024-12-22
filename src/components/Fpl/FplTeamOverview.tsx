import React, { useEffect, useState } from 'react';
import FplService from '../../services/fplService';
import type { FplTeamInfo } from '../../types/fpl';

interface FplTeamOverviewProps {
  teamId?: string;
}

const FplTeamOverview: React.FC<FplTeamOverviewProps> = ({ teamId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<FplTeamInfo | null>(null);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (!teamId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.group('FPL Team Info');
        console.log('Fetching for ID:', teamId);
        const info = await FplService.getTeamInfo(teamId);
        console.log('Response:', info);
        console.groupEnd();
        
        setTeamInfo({
          ...info,
          leagues: {
            ...info.leagues,
            classic: info.leagues.classic.map(league => ({
              ...league,
              created_at: '' // Add missing required property
            }))
          }
        });
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load FPL team info');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamInfo();
  }, [teamId]);

  if (!teamId) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">
          No FPL Team ID set. Update your profile to add your team.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-white shadow rounded-lg p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <h3 className="font-medium">Error Loading Team</h3>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-700 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!teamInfo) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold">{teamInfo.name}</h2>
        <p className="text-gray-600">
          Manager: {teamInfo.player_first_name} {teamInfo.player_last_name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Overall Points</p>
          <p className="text-3xl font-bold text-green-700">
            {teamInfo.summary_overall_points}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Overall Rank</p>
          <p className="text-3xl font-bold text-blue-700">
            #{teamInfo.summary_overall_rank?.toLocaleString()}
          </p>
        </div>
      </div>

      {teamInfo.leagues?.classic && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Leagues</h3>
          <div className="space-y-2">
            {teamInfo.leagues.classic.map(league => (
              <div 
                key={league.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <span className="font-medium">{league.name}</span>
                <span className="text-gray-600">
                  Rank: #{league.ranking?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FplTeamOverview; 