export interface FplHistory {
  id: string;
  user_id: string;
  total_points: number;
  overall_rank: number;
  transfers_made: number;
  created_at: string;
  season: string;
}

export interface FplLeague {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  season: string;
}

export interface FplLeagueMember {
  league_id: string;
  user_id: string;
  joined_at: string;
}

// API response types
export interface FplTeamInfo {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  current_event: number;
  leagues: {
    classic: Array<{
      id: number;
      name: string;
      created_at: string;
      ranking: number;
    }>;
  };
}

export interface FplGameweekHistory {
  current: Array<{
    event: number;
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
  }>;
}

export interface FplPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  element_type: number;
  team: number;
  total_points: number;
  now_cost: number;
  selected_by_percent: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  saves?: number;
}

export interface FplBootstrapResponse {
  events: FplGameweek[];
  teams: FplTeam[];
  elements: FplPlayer[];
  element_types: FplElementType[];
}

export interface FplGameweek {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number;
  is_current: boolean;
  is_next: boolean;
}

export interface FplElementType {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
}

export interface FplTeam {
  id: number;
  name: string;
  short_name: string;
  strength: number;
}

// Service response types (vad vår service returnerar till komponenter)
export interface FplGameweekData {
  current: FplGameweek;
  next: FplGameweek | null;
  gameweeks: FplGameweek[];
}

export interface FplTeamData {
  allTeams: FplTeam[];
  playerTeam?: FplTeam;
}

// ... andra FPL-relaterade typer 