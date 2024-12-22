import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FplService from '../services/fplService';

export function useFplUpdates(interval = 300000) { // 5 minuter
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const updateFplData = async () => {
      try {
        setLoading(true);
        const profile = await FplService.getUserProfile(user.id);
        
        if (profile?.fpl_team_id) {
          await FplService.updateTeamData(profile.fpl_team_id);
        }
        
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update FPL data'));
      } finally {
        setLoading(false);
      }
    };

    updateFplData();
    const timer = setInterval(updateFplData, interval);

    return () => clearInterval(timer);
  }, [user, interval]);

  return { loading, error, lastUpdate };
} 