import { supabase } from '../lib/supabaseClient';
import { 
  FplBootstrapResponse, 
  FplGameweekData,
  FplTeamData 
} from '../types/fpl';

interface FplTeamInfo {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  current_event: number;
  transfers_made: number;
  leagues: {
    classic: Array<{
      id: number;
      name: string;
      ranking: number;
    }>;
  };
}

interface FplPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  element_type: number; // 1: GK, 2: DEF, 3: MID, 4: FWD
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

interface FplTeamPicks {
  element: number;  // Player ID
  position: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

class FplError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FplError';
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface LocalLeaderboardEntry {
  id: string;
  manager_name: string;
  team_name: string;
  gameweek_points: number;
  total_points: number;
}

export default class FplService {
  private static baseUrl = 'https://fantasy.premierleague.com/api';
  
  // Uppdaterade endpoints baserat på dokumentationen
  private static endpoints = {
    bootstrap: '/bootstrap-static/',
    fixtures: '/fixtures/',
    fixturesByGameweek: (gameweek: number) => `/fixtures/?event=${gameweek}`,
    playerSummary: (playerId: number) => `/element-summary/${playerId}/`,
    gameweekLive: (gameweek: number) => `/event/${gameweek}/live/`,
    managerInfo: (managerId: string) => `/entry/${managerId}/`,
    managerHistory: (managerId: string) => `/entry/${managerId}/history/`,
    managerTransfers: (managerId: string) => `/entry/${managerId}/transfers/`,
    managerPicks: (managerId: string, gameweek: number) => 
      `/entry/${managerId}/event/${gameweek}/picks/`,
    leagueStandings: (leagueId: string) => `/leagues-classic/${leagueId}/standings/`,
    eventStatus: '/event-status/',
    dreamTeam: (gameweek: number) => `/dream-team/${gameweek}/`,
    setPieceNotes: '/team/set-piece-notes/'
  };

  private static proxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://proxy.cors.sh/'
  ];

  private static async fetchWithProxy(url: string) {
    // Försök först utan proxy
    try {
      console.log('Attempting direct fetch:', url);
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      console.log('Direct fetch failed with status:', response.status);
    } catch (error) {
      console.log('Direct fetch failed:', error);
    }

    // Prova proxies
    for (const proxy of this.proxies) {
      try {
        console.log('Trying proxy:', proxy);
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          console.log(`Proxy ${proxy} failed with status:`, response.status);
          continue;
        }

        const data = await response.json();
        console.log('Successfully fetched data with proxy:', proxy);
        return data;
      } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error);
      }
    }

    throw new Error('All fetch attempts failed');
  }

  private static cache = new Map<string, {
    data: any;
    timestamp: number;
  }>();
  
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minuter

  static async getTeamInfo(teamId: string) {
    const cacheKey = `team_${teamId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.fetchWithRetry(
        `/entry/${teamId}/`,
        'Failed to fetch team info'
      );
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching team info:', error);
      throw new Error('Could not fetch team information');
    }
  }

  private static async fetchWithRetry<T>(
    endpoint: string, 
    errorMessage: string,
    retries = 3
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await this.fetchWithProxy(endpoint);
        return data as T;
      } catch (error) {
        if (i === retries - 1) throw new Error(errorMessage);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error(errorMessage);
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private static async saveTeamHistory(fplTeamId: string, data: FplTeamInfo) {
    try {
      // Hämta först user_id från profiles baserat på fpl_team_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('fpl_team_id', fplTeamId)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No user found with this FPL team ID');

      const { error } = await supabase
        .from('fpl_history')
        .insert({
          user_id: profile.id,  // Använd auth.user_id istället för FPL team ID
          total_points: data.summary_overall_points,
          overall_rank: data.summary_overall_rank,
          transfers_made: data.transfers_made || 0,
          season: '2023/24'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving FPL history:', err);
      throw err;  // Re-throw för bättre error handling
    }
  }

  static async updateAllTeams() {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, fpl_team_id')
        .not('fpl_team_id', 'is', null);

      if (error) throw error;

      const updates = profiles.map(profile => 
        this.getTeamInfo(profile.fpl_team_id)
      );

      await Promise.allSettled(updates);
    } catch (err) {
      console.error('Error updating teams:', err);
    }
  }

  static async testConnection(teamId: string) {
    try {
      // Testa först bootstrap för att se om API:et är tillgängligt
      await this.fetchWithProxy(this.baseUrl + this.endpoints.bootstrap);
      
      // Sedan testa manager info
      const data = await this.fetchWithProxy(
        this.baseUrl + this.endpoints.managerInfo(teamId)
      );

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('FPL API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async checkApiStatus() {
    try {
      const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
      return {
        available: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getTeamPlayers(teamId: string, event: number) {
    try {
      // Först hämta picks från FPL API
      const picks = await this.fetchWithProxy(
        `${this.baseUrl}/entry/${teamId}/event/${event}/picks/`
      );

      // Spara picks i databasen
      const { error: picksError } = await supabase
        .from('fpl_team_picks')
        .upsert(
          picks.picks.map((pick: FplTeamPicks) => ({
            user_id: teamId,
            gameweek: event,
            player_id: pick.element,
            position: pick.position,
            is_captain: pick.is_captain,
            is_vice_captain: pick.is_vice_captain
          }))
        );

      if (picksError) throw picksError;

      // Hämta komplett spelardata från vår databas
      const { data: players, error: playersError } = await supabase
        .from('fpl_players')
        .select('*')
        .in('id', picks.picks.map((p: FplTeamPicks) => p.element));

      if (playersError) throw playersError;

      // Kombinera data och gruppera efter position
      return this.groupPlayersByPosition(players, picks.picks);
    } catch (error) {
      console.error('Error getting team players:', error);
      throw error;
    }
  }

  private static groupPlayersByPosition(players: FplPlayer[], picks: FplTeamPicks[]) {
    const picksMap = new Map(picks.map(p => [p.element, p]));
    
    return players.reduce((acc, player) => {
      const pick = picksMap.get(player.id);
      const pos = this.getPositionName(player.element_type);
      
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push({
        ...player,
        position: pick?.position,
        is_captain: pick?.is_captain,
        is_vice_captain: pick?.is_vice_captain
      });
      
      return acc;
    }, {} as Record<string, any[]>);
  }

  private static getPositionName(elementType: number): string {
    switch (elementType) {
      case 1: return 'Goalkeepers';
      case 2: return 'Defenders';
      case 3: return 'Midfielders';
      case 4: return 'Forwards';
      default: return 'Unknown';
    }
  }

  static async updatePlayers(players: FplPlayer[]) {
    try {
      const { error } = await supabase
        .from('fpl_players')
        .upsert(
          players.map(player => ({
            id: player.id,
            web_name: player.web_name,
            first_name: player.first_name,
            second_name: player.second_name,
            element_type: player.element_type,
            team: player.team,
            total_points: player.total_points,
            now_cost: player.now_cost,
            selected_by_percent: player.selected_by_percent,
            minutes: player.minutes,
            goals_scored: player.goals_scored,
            assists: player.assists,
            clean_sheets: player.clean_sheets,
            saves: player.saves
          }))
        );

      if (error) throw error;
    } catch (err) {
      console.error('Error updating players:', err);
      throw err;
    }
  }

  static async updateAllPlayersData() {
    try {
      console.log('Updating all players data...');
      
      // Hämta bootstrap-static data som innehåller alla spelare
      const data = await this.fetchWithProxy(`${this.baseUrl}/bootstrap-static/`);
      
      // Uppdatera spelare i databasen
      await this.updatePlayers(data.elements);
      
      console.log('Players data updated successfully');
    } catch (error) {
      console.error('Error updating players data:', error);
      throw error;
    }
  }

  // Testa alla endpoints för att verifiera tillgång
  static async testApi() {
    try {
      console.group('Testing FPL API endpoints');
      
      // Test bootstrap
      console.log('Testing bootstrap...');
      const bootstrap = await this.fetchWithProxy(this.baseUrl + this.endpoints.bootstrap);
      console.log('Bootstrap OK, current gameweek:', bootstrap.events.find((e: any) => e.is_current)?.id);
      
      // Test fixtures
      console.log('Testing fixtures...');
      const fixtures = await this.fetchWithProxy(this.baseUrl + this.endpoints.fixtures);
      console.log('Fixtures OK, count:', fixtures.length);
      
      // Test gameweeks
      console.log('Testing gameweeks...');
      const gameweeks = await this.fetchWithProxy(this.baseUrl + this.endpoints.gameweeks);
      console.log('Gameweeks OK, count:', gameweeks.length);
      
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('API Test failed:', error);
      console.groupEnd();
      return false;
    }
  }

  private static async debugFetch(endpoint: string) {
    console.group(`Fetching ${endpoint}`);
    try {
      const fullUrl = this.baseUrl + endpoint;
      console.log('Full URL:', fullUrl);
      
      const response = await fetch(fullUrl);
      console.log('Response status:', response.status);
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  private static bootstrapCache: FplBootstrapResponse | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minuter
  private static lastCacheTime = 0;

  private static async getBootstrapData(forceRefresh = false): Promise<FplBootstrapResponse> {
    const now = Date.now();
    
    // Använd cache om tillgänglig och inte för gammal
    if (
      !forceRefresh && 
      this.bootstrapCache &&
      now - this.lastCacheTime < this.CACHE_DURATION
    ) {
      return this.bootstrapCache;
    }

    const data = await this.fetchWithProxy('/bootstrap-static/');
    
    // Validera data
    if (!this.validateBootstrapData(data)) {
      throw new Error('Invalid API response structure');
    }

    // Uppdatera cache
    this.bootstrapCache = data;
    this.lastCacheTime = now;
    
    return data;
  }

  static async getGameweekData(): Promise<FplGameweekData> {
    const data = await this.getBootstrapData();
    
    const current = data.events.find(gw => gw.is_current);
    const next = data.events.find(gw => gw.is_next);
    
    if (!current) throw new Error('No current gameweek found');
    
    return {
      current,
      next: next || null,
      gameweeks: data.events
    };
  }

  static async getTeamData(teamId?: number): Promise<FplTeamData> {
    const data = await this.getBootstrapData();
    
    return {
      allTeams: data.teams,
      playerTeam: teamId ? data.teams.find(t => t.id === teamId) : undefined
    };
  }

  private static validateBootstrapData(data: any): data is FplBootstrapResponse {
    return (
      data &&
      Array.isArray(data.events) &&
      Array.isArray(data.teams) &&
      Array.isArray(data.elements)
    );
  }

  // Hämta manager info och historik
  static async getManagerInfo(managerId: string) {
    try {
      const [info, history] = await Promise.all([
        this.fetchWithProxy(this.baseUrl + this.endpoints.managerInfo(managerId)),
        this.fetchWithProxy(this.baseUrl + this.endpoints.managerHistory(managerId))
      ]);

      return {
        info,
        history: {
          current: history.current,
          past: history.past,
          chips: history.chips
        }
      };
    } catch (error) {
      console.error('Error fetching manager data:', error);
      throw error;
    }
  }

  // Hämta laguppställning för en specifik gameweek
  static async getTeamPicks(managerId: string, gameweek: number) {
    try {
      const data = await this.fetchWithProxy(
        this.baseUrl + this.endpoints.managerPicks(managerId, gameweek)
      );

      // Hämta även live-data för spelarna
      const liveData = await this.fetchWithProxy(
        this.baseUrl + this.endpoints.gameweekLive(gameweek)
      );

      // Kombinera picks med live-data
      return {
        picks: data.picks,
        liveData: liveData.elements,
        entry_history: data.entry_history
      };
    } catch (error) {
      console.error('Error fetching team picks:', error);
      throw error;
    }
  }

  static async runApiTests() {
    try {
      console.group('🧪 Running FPL API Tests');
      
      // Test 1: Bootstrap Static
      console.group('1. Testing Bootstrap Static');
      try {
        const bootstrap = await this.fetchWithProxy(`${this.baseUrl}/bootstrap-static/`);
        console.log('✅ Current Gameweek:', bootstrap.events.find((e: any) => e.is_current)?.id);
        console.log('✅ Total Players:', bootstrap.elements?.length);
        console.log('✅ Total Teams:', bootstrap.teams?.length);
      } catch (error) {
        console.error('❌ Bootstrap test failed:', error);
      }
      console.groupEnd();

      // Test 2: Manager Info
      console.group('2. Testing Manager Info');
      try {
        const managerId = '1317910'; // Använd ett känt team-ID för test
        const manager = await this.fetchWithProxy(`${this.baseUrl}/entry/${managerId}/`);
        console.log('✅ Manager Name:', manager.player_first_name, manager.player_last_name);
        console.log('✅ Team Name:', manager.name);
        console.log('✅ Overall Points:', manager.summary_overall_points);
      } catch (error) {
        console.error('❌ Manager info test failed:', error);
      }
      console.groupEnd();

      // Test 3: Manager History
      console.group('3. Testing Manager History');
      try {
        const managerId = '1317910';
        const history = await this.fetchWithProxy(`${this.baseUrl}/entry/${managerId}/history/`);
        console.log('✅ Current Season Games:', history.current?.length);
        console.log('✅ Past Seasons:', history.past?.length);
      } catch (error) {
        console.error('❌ History test failed:', error);
      }
      console.groupEnd();

      // Test 4: Current Gameweek Picks
      console.group('4. Testing Team Picks');
      try {
        const managerId = '1317910';
        const currentGw = await this.getCurrentGameweek();
        const picks = await this.fetchWithProxy(
          `${this.baseUrl}/entry/${managerId}/event/${currentGw}/picks/`
        );
        console.log('✅ Team Size:', picks.picks?.length);
        console.log('✅ Captain:', picks.picks?.find((p: any) => p.is_captain));
      } catch (error) {
        console.error('❌ Picks test failed:', error);
      }
      console.groupEnd();

      // Test 5: Live Gameweek Data
      console.group('5. Testing Live Data');
      try {
        const currentGw = await this.getCurrentGameweek();
        const live = await this.fetchWithProxy(`${this.baseUrl}/event/${currentGw}/live/`);
        console.log('✅ Live Data Available:', !!live.elements);
        console.log('✅ Players with Data:', Object.keys(live.elements).length);
      } catch (error) {
        console.error('❌ Live data test failed:', error);
      }
      console.groupEnd();

      // Test 6: Fixtures
      console.group('6. Testing Fixtures');
      try {
        const fixtures = await this.fetchWithProxy(`${this.baseUrl}/fixtures/`);
        console.log('✅ Total Fixtures:', fixtures.length);
        console.log('✅ Next Fixture:', fixtures.find((f: any) => !f.finished));
      } catch (error) {
        console.error('❌ Fixtures test failed:', error);
      }
      console.groupEnd();

      console.groupEnd();
    } catch (error) {
      console.error('❌ API Tests failed:', error);
    }
  }

  // Hjälpmetod för att hämta aktuell gameweek
  private static async getCurrentGameweek(): Promise<number> {
    const bootstrap = await this.fetchWithProxy(`${this.baseUrl}/bootstrap-static/`);
    const currentGw = bootstrap.events.find((e: any) => e.is_current)?.id;
    if (!currentGw) throw new Error('Could not determine current gameweek');
    return currentGw;
  }

  private static handleError(error: unknown, context: string): never {
    if (error instanceof FplError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new FplError(
        `${context}: ${error.message}`,
        'FPL_ERROR',
        error
      );
    }
    
    throw new FplError(
      `${context}: Unknown error`,
      'UNKNOWN_ERROR'
    );
  }

  static async getBootstrapData(forceRefresh = false): Promise<FplBootstrapResponse> {
    return this.withRetry(async () => {
      // ... existerande kod ...
    });
  }

  private static async withRetry<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Attempt ${i + 1} failed:`, error);
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  private static requestQueue: Promise<any> = Promise.resolve();
  private static readonly MIN_REQUEST_INTERVAL = 1000; // 1 sekund

  private static async rateLimit<T>(operation: () => Promise<T>): Promise<T> {
    this.requestQueue = this.requestQueue.then(async () => {
      const result = await operation();
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL));
      return result;
    });
    
    return this.requestQueue;
  }

  static async getBootstrapData(forceRefresh = false): Promise<FplBootstrapResponse> {
    return this.rateLimit(async () => {
      // ... existerande kod ...
    });
  }

  private static cache = new Map<string, CacheEntry<any>>();

  private static async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl = 5 * 60 * 1000
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);
    
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }
    
    const data = await operation();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    
    return data;
  }

  static async getLocalLeaderboard(): Promise<LocalLeaderboardEntry[]> {
    // Hämta alla användare med FPL ID
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .not('fpl_team_id', 'is', null);

    if (error) throw error;

    // Hämta FPL data för varje användare
    const leaderboardData = await Promise.all(
      profiles.map(async (profile) => {
        const teamInfo = await this.getTeamInfo(profile.fpl_team_id);
        return {
          id: profile.id,
          manager_name: profile.nickname,
          team_name: profile.fpl_team_name,
          gameweek_points: teamInfo.current_event_points,
          total_points: teamInfo.summary_overall_points
        };
      })
    );

    // Sortera efter totalpoäng
    return leaderboardData.sort((a, b) => b.total_points - a.total_points);
  }
} 