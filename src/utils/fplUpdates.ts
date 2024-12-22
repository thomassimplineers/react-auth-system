import { supabase } from '../lib/supabaseClient';
import FeedEventHandler from './FeedEventHandler';

interface FplTeamData {
  total_points: number;
  overall_rank: number;
  transfers_made: number;
}

interface ProfileData {
  id: string;
  nickname: string;
  fpl_team_id: string;
}

export const checkFplUpdates = async () => {
  try {
    // Hämta alla användare med FPL team IDs
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, nickname, fpl_team_id')
      .not('fpl_team_id', 'is', null);

    if (error) throw error;

    // Kontrollera varje användares FPL-team
    for (const profile of profiles) {
      await checkUserFplTeam(profile);
    }
  } catch (error) {
    console.error('Error checking FPL updates:', error);
  }
};

const checkUserFplTeam = async (profile: ProfileData) => {
  try {
    // Hämta senaste data från FPL API
    const response = await fetch(
      `https://fantasy.premierleague.com/api/entry/${profile.fpl_team_id}/`
    );
    
    if (!response.ok) throw new Error('FPL API error');
    
    const fplData: FplTeamData = await response.json();

    // Hämta tidigare sparad data för jämförelse
    const { data: lastKnownData } = await supabase
      .from('fpl_history')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Kontrollera förändringar och skapa events
    if (lastKnownData) {
      const rankChange = lastKnownData.overall_rank - fplData.overall_rank;
      const pointsChange = fplData.total_points - lastKnownData.total_points;

      if (pointsChange > 0 || rankChange !== 0) {
        await FeedEventHandler.handleFplUpdate(
          profile.id,
          fplData.total_points,
          fplData.overall_rank,
          rankChange
        );
      }
    }

    // Spara ny data
    await supabase
      .from('fpl_history')
      .insert({
        user_id: profile.id,
        total_points: fplData.total_points,
        overall_rank: fplData.overall_rank,
        transfers_made: fplData.transfers_made
      });

  } catch (error) {
    console.error(`Error checking FPL team for user ${profile.nickname}:`, error);
  }
}; 