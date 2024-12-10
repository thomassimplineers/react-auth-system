import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    getProfile();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [session]);

  const getProfile = async (retryCount = 0) => {
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) { // 5 seconds cooldown
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);
      const { user } = session;

      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        // If we get a resource error and haven't retried too many times, try again
        if (error.message.includes('ERR_INSUFFICIENT_RESOURCES') && retryCount < 3) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff
          retryTimeoutRef.current = setTimeout(() => {
            getProfile(retryCount + 1);
          }, retryDelay);
          return;
        }
        throw error;
      }
      
      if (data) {
        setNickname(data.nickname);
        setAvatarUrl(data.avatar_url);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      const { user } = session;

      const updates = {
        id: user.id,
        nickname,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      setError('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className={`mb-4 p-4 rounded ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        )}
        
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={session.user.email}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nickname</label>
            <input
              type="text"
              value={nickname || ''}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="url"
              value={avatar_url || ''}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;