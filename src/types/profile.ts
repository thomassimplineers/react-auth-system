// Skapa ny fil för profile types
export interface ProfileData {
  id?: string;
  nickname: string;
  avatar_url: string | null;
  fpl_team_id?: string | null;
  updated_at?: string;
}

export interface ProfileUpdate {
  id: string;
  nickname?: string;
  avatar_url?: string | null;
  fpl_team_id?: string | null;
  updated_at?: string;
} 