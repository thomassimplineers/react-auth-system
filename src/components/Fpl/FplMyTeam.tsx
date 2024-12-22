import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import FplTeamOverview from './FplTeamOverview';
import TeamSquad from './TeamSquad';
import FplService from '../../services/fplService';
import type { FplPlayer } from '../../types/fpl';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface SquadData {
  Goalkeepers: FplPlayer[];
  Defenders: FplPlayer[];
  Midfielders: FplPlayer[];
  Forwards: FplPlayer[];
}

const FplMyTeam: React.FC = () => {
  const { user } = useAuth();
  const [fplTeamId, setFplTeamId] = useState<string | null>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number>(0);
  const [squad, setSquad] = useState<SquadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hämta FPL team ID från profilen
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('fpl_team_id')
          .eq('id', user?.id)
          .single();

        if (error) throw error;
        setFplTeamId(data?.fpl_team_id);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Could not load FPL team ID');
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Hämta aktuell gameweek och squad
  useEffect(() => {
    const fetchSquad = async () => {
      if (!fplTeamId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Först hämta team info för att få current gameweek
        const teamInfo = await FplService.getTeamInfo(fplTeamId);
        setCurrentGameweek(teamInfo.current_event);

        // Sedan hämta squad för den gameweeken
        const squadData = await FplService.getTeamPlayers(
          fplTeamId, 
          teamInfo.current_event
        );
        setSquad(squadData);
      } catch (err) {
        console.error('Error fetching squad:', err);
        setError('Could not load team squad');
      } finally {
        setLoading(false);
      }
    };

    fetchSquad();
  }, [fplTeamId]);

  if (!fplTeamId) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No FPL Team Connected</h3>
        <p className="mt-2 text-sm text-gray-500">
          Add your FPL Team ID in your profile settings to view your team information here.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div>Loading team data...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FplTeamOverview teamId={fplTeamId} />
      
      {squad && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Current Squad (GW {currentGameweek})
          </h2>
          <TeamSquad squad={squad} />
        </div>
      )}
    </div>
  );
};

export default FplMyTeam; 