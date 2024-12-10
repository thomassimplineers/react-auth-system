import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      getProfile();
    }
  }, [session?.user?.id]);

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setNickname(data.nickname || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Could not load profile');
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
      setSuccess(null);

      const updates = {
        id: session.user.id,
        nickname,
        avatar_url,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded bg-green-100 border border-green-400 text-green-700">
            {success}
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
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="url"
              value={avatar_url}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {avatar_url && (
            <div className="mt-2">
              <img
                src={avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80';
                  setError('Could not load avatar image');
                }}
              />
            </div>
          )}

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