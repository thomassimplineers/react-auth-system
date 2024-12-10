import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '',
    avatar_url: ''
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Load profile once
  useEffect(() => {
    if (!session?.user?.id) return;
    loadProfile();
  }, [session?.user?.id]);

  // Subscribe to real-time online status updates
  useEffect(() => {
    const subscription = supabase
      .channel('online-users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_status' }, 
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Initial fetch
    fetchOnlineUsers();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOnlineUsers = async () => {
    const { data } = await supabase
      .from('user_status')
      .select(`
        id,
        is_online,
        profiles:id (nickname)
      `)
      .eq('is_online', true);

    if (data) {
      setOnlineUsers(data);
    }
  };

  const loadProfile = async () => {
    if (!session?.user?.id || loading) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Could not load profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setStatusMessage({ type: '', text: '' });

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setStatusMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });

      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        {statusMessage.text && (
          <div
            className={`mb-4 p-3 rounded border ${statusMessage.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'}`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="text"
                  value={session.user.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nickname</label>
                <input
                  type="text"
                  name="nickname"
                  value={profile.nickname}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                <input
                  type="url"
                  name="avatar_url"
                  value={profile.avatar_url || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {profile.avatar_url && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80';
                      setStatusMessage({
                        type: 'error',
                        text: 'Could not load avatar image'
                      });
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

          <div className="col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Online Users</h3>
            <div className="space-y-2">
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">
                    {user.profiles?.nickname || 'Anonymous'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;