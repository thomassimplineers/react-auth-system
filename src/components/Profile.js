import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { user } = session;
      const updates = {
        id: user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} />
              <label className="block text-sm font-medium text-gray-700">Email</label>
            </div>
            <input
              type="email"
              value={session.user.email}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} />
              <label className="block text-sm font-medium text-gray-700">Username</label>
            </div>
            <input
              type="text"
              value={username || ''}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
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