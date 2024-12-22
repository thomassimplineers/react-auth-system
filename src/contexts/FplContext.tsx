import React, { createContext, useContext, useState } from 'react';
import type { FplGameweekData, FplTeamData } from '../types/fpl';

interface FplContextType {
  gameweekData: FplGameweekData | null;
  teamData: FplTeamData | null;
  loading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
}

const FplContext = createContext<FplContextType | undefined>(undefined);

export function FplProvider({ children }: { children: React.ReactNode }) {
  const [gameweekData, setGameweekData] = useState<FplGameweekData | null>(null);
  const [teamData, setTeamData] = useState<FplTeamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [gw, team] = await Promise.all([
        FplService.getGameweekData(),
        FplService.getTeamData()
      ]);
      
      setGameweekData(gw);
      setTeamData(team);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh data'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FplContext.Provider value={{
      gameweekData,
      teamData,
      loading,
      error,
      refreshData
    }}>
      {children}
    </FplContext.Provider>
  );
}

export const useFpl = () => {
  const context = useContext(FplContext);
  if (context === undefined) {
    throw new Error('useFpl must be used within a FplProvider');
  }
  return context;
}; 