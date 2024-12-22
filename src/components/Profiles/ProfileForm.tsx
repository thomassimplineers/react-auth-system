import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const ProfileForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [fplTeamId, setFplTeamId] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, fpl_team_id')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setNickname(data.nickname || '');
        setFplTeamId(data.fpl_team_id || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          nickname,
          fpl_team_id: fplTeamId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
            Nickname
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fpl-team-id" className="block text-sm font-medium text-gray-700">
            FPL Team ID
          </label>
          <input
            id="fpl-team-id"
            type="text"
            value={fplTeamId}
            onChange={(e) => setFplTeamId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter your FPL Team ID"
          />
          <div className="mt-2 space-y-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
            <p className="font-medium">How to find your FPL Team ID:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to <a href="https://fantasy.premierleague.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">fantasy.premierleague.com</a> and log in</li>
              <li>Click on the 'Points' tab in your team</li>
              <li>Look at your browser's address bar</li>
              <li>Your Team ID is the number in the URL after '/entry/'</li>
            </ol>
            <p className="mt-2 italic border-t border-gray-200 pt-2">
              Example: In https://fantasy.premierleague.com/entry/123456/event/1 
              <br />
              <span className="font-semibold">the Team ID is 123456</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;

