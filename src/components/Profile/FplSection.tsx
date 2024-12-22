import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import FplService from '../../services/fplService';

const FplSection: React.FC = () => {
  const { user } = useAuth();
  const [fplId, setFplId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentFplId, setCurrentFplId] = useState<string | null>(null);

  // Hämta nuvarande FPL ID när komponenten laddas
  useEffect(() => {
    async function fetchCurrentFplId() {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('fpl_team_id')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setCurrentFplId(data.fpl_team_id);
        if (data.fpl_team_id) {
          setFplId(data.fpl_team_id);
        }
      }
    }

    fetchCurrentFplId();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validera att FPL ID:t existerar
      const teamInfo = await FplService.getTeamInfo(fplId);
      
      // Uppdatera profilen med det nya FPL ID:t
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          fpl_team_id: fplId,
          fpl_team_name: teamInfo.name
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;
      
      setSuccess(true);
      setCurrentFplId(fplId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update FPL ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium">Fantasy Premier League</h3>
      <div className="mt-2">
        {currentFplId && (
          <p className="text-sm text-gray-600 mb-4">
            Current FPL Team ID: {currentFplId}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fpl-id" className="block text-sm font-medium text-gray-700">
              {currentFplId ? 'Update FPL Team ID' : 'Add FPL Team ID'}
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="fpl-id"
                value={fplId}
                onChange={(e) => setFplId(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your FPL Team ID"
              />
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (currentFplId ? 'Update' : 'Save')}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="mt-2 text-sm text-green-600">
                FPL Team ID successfully {currentFplId ? 'updated' : 'added'}!
              </p>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium mb-2">How to find your FPL Team ID:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://fantasy.premierleague.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">fantasy.premierleague.com</a></li>
              <li>Log in and go to the "Points" tab</li>
              <li>Look at the URL - your Team ID is the number after "/entry/"</li>
            </ol>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FplSection; 