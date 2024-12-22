import { describe, it, expect, beforeEach, vi } from 'vitest';
import FplService from './fplService';

// Mock data
const mockBootstrapData = {
  events: [{ id: 1, is_current: true }],
  teams: [{ id: 1, name: 'Arsenal' }],
  elements: [{ id: 1, web_name: 'Saka' }],
  element_types: [{ id: 1, singular_name: 'Goalkeeper' }]
};

const mockManagerData = {
  id: 1317910,
  name: 'Test Team',
  player_first_name: 'John',
  player_last_name: 'Doe',
  summary_overall_points: 1000,
  summary_overall_rank: 100000
};

const mockPicksData = {
  picks: Array(15).fill({
    element: 1,
    position: 1,
    is_captain: false,
    is_vice_captain: false
  })
};

describe('FPL API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch för både direkt anrop och proxy
    global.fetch = vi.fn().mockImplementation((url: string) => {
      // Hantera både direkt URL och proxy URL
      const actualUrl = url.includes('corsproxy.io') 
        ? decodeURIComponent(url.split('corsproxy.io/?')[1])
        : url;

      // Simulera CORS fel för direkta anrop
      if (!url.includes('corsproxy.io')) {
        return Promise.reject(new Error('CORS error'));
      }

      // Matcha mot den faktiska URL:en
      if (actualUrl.includes('bootstrap-static')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBootstrapData)
        });
      }
      if (actualUrl.includes('/entry/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockManagerData)
        });
      }
      if (actualUrl.includes('/picks/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPicksData)
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${actualUrl}`));
    });
  });
  it('should fetch bootstrap data with correct structure', async () => {
    const fplService = new FplService();
    const data = await fplService.getBootstrapData();
    
    // Kontrollera att data finns och har rätt struktur
    expect(data).toBeDefined();
    expect(data).toEqual(expect.objectContaining({
      gameweeks: expect.any(Array),
      teams: expect.any(Array),
      players: expect.any(Array),
      elementTypes: expect.any(Array)
    }));

    // Kontrollera gameweeks
    expect(data.gameweeks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          is_current: expect.any(Boolean)
        })
      ])
    );

    // Kontrollera teams
    expect(data.teams).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String)
        })
      ])
    );

    // Kontrollera players
    expect(data.players).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          web_name: expect.any(String)
        })
      ])
    );

    // Kontrollera specifika värden från mock-data
    const currentGameweek = data.gameweeks.find(gw => gw.is_current);
    expect(currentGameweek?.id).toBe(1);

    const arsenal = data.teams.find(team => team.name === 'Arsenal');
    expect(arsenal?.id).toBe(1);

    const saka = data.players.find(player => player.web_name === 'Saka');
    expect(saka?.id).toBe(1);
  });

  it('should cache bootstrap data for subsequent calls', async () => {
    // Första anropet
    const firstCall = await FplService.getBootstrapData();
    
    // Andra anropet bör använda cache
    const secondCall = await FplService.getBootstrapData();
    
    // Verifiera att fetch bara anropades en gång
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Verifiera att båda anropen returnerade samma data
    expect(secondCall).toEqual(firstCall);
  });

  it('should refresh bootstrap data if forced', async () => {
    // Första anropet
    await FplService.getBootstrapData();
    
    // Tvinga uppdatering
    await FplService.getBootstrapData(true);
    
    // Verifiera att fetch anropades två gånger
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle missing data in bootstrap response', async () => {
    // Mocka ett ofullständigt svar
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve(createMockResponse({
        events: null,
        teams: [],
        elements: undefined
      }))
    );

    await expect(FplService.getBootstrapData()).rejects
      .toThrow('Invalid bootstrap data structure');
  });

  it('should fetch manager info', async () => {
    const managerId = '1317910';
    const data = await FplService.getManagerInfo(managerId);
    expect(data.info).toBeDefined();
    expect(data.info.name).toBe('Test Team');
    expect(data.info.player_first_name).toBe('John');
  });

  it('should fetch current gameweek picks', async () => {
    const managerId = '1317910';
    const currentGw = 1;  // Hardcoded for test
    const picks = await FplService.getTeamPicks(managerId, currentGw);
    expect(picks.picks).toHaveLength(15);
  });

  it('should test all major endpoints', async () => {
    const results = await FplService.runApiTests();
    expect(results).toBe(true);
  });

  // Lägg till test för felhantering
  it('should handle fetch errors', async () => {
    // Simulera ett nätverksfel
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(FplService.getBootstrapData()).rejects.toThrow('Network error');
  });

  describe('Error handling', () => {
    it('should handle empty response', async () => {
      global.fetch = vi.fn().mockResolvedValue(undefined);
      
      await expect(FplService.getBootstrapData()).rejects
        .toThrow('No response received');
    });

    it('should handle non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue(new Response('Not Found', {
        status: 404,
        statusText: 'Not Found'
      }));
      
      await expect(FplService.getBootstrapData()).rejects
        .toThrow('HTTP error! status: 404 - Not Found');
    });

    it('should handle invalid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue(new Response('Invalid JSON'));
      
      await expect(FplService.getBootstrapData()).rejects
        .toThrow();
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(FplService.getBootstrapData()).rejects
        .toThrow('Network error');
    });

    it('should try all proxies before failing', async () => {
      // Simulera att alla proxies misslyckas
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Proxy 1 failed'))
        .mockRejectedValueOnce(new Error('Proxy 2 failed'))
        .mockRejectedValueOnce(new Error('Proxy 3 failed'));
      
      await expect(FplService.getBootstrapData()).rejects
        .toThrow('Proxy 3 failed');
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Fetch handling', () => {
    it('should try direct fetch first', async () => {
      // Mocka ett lyckat direkt anrop
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockResponse(mockBootstrapData)
      );

      await FplService.getBootstrapData();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/bootstrap-static/')
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fall back to proxies if direct fetch fails', async () => {
      // Mocka misslyckat direkt anrop och lyckat proxy-anrop
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('CORS error'))
        .mockResolvedValueOnce(createMockResponse(mockBootstrapData));

      await FplService.getBootstrapData();
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('corsproxy.io')
      );
    });

    it('should handle JSON parse errors', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response('Invalid JSON data')
      );

      await expect(FplService.getBootstrapData()).rejects
        .toThrow(/JSON/);
    });

    it('should provide detailed error messages', async () => {
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('CORS error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'));

      await expect(FplService.getBootstrapData()).rejects
        .toThrow(/Timeout/);
    });
  });
});