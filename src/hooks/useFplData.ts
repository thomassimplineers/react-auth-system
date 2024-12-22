import { useState, useEffect, useCallback } from 'react';
import FplService from '../services/fplService';
import { FplGameweekData, FplTeamData, LocalLeaderboardEntry } from '../types/fpl';

export function useFplData() {
  const [localLeaderboard, setLocalLeaderboard] = useState<LocalLeaderboardEntry[]>([]);
  const [gameweekData, setGameweekData] = useState<FplGameweekData | null>(null);
  const [teamData, setTeamData] = useState<FplTeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [local, gw, team] = await Promise.all([
          FplService.getLocalLeaderboard(),
          FplService.getGameweekData(),
          FplService.getTeamData()
        ]);
        
        setLocalLeaderboard(local);
        setGameweekData(gw);
        setTeamData(team);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = useCallback(async () => {
    fetchData();
  }, []);

  return { 
    localLeaderboard,
    gameweekData, 
    teamData, 
    loading, 
    error, 
    refetch 
  };
} 