import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '',
    avatar_url: ''
  });
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log('Loading profile for user:', session.user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('nickname, avatar_url')
          .eq('id', session.user.id)
          .single();

        console.log('Profile data:', data);
        console.log('Profile error:', error);

        if (error) throw error;
        if (data && isMounted) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (isMounted) {
          setStatusMessage({
            type: 'error',
            text: 'Could not load profile'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (session?.user?.id) {
      loadProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [session]);

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
      console.log('Updating profile with:', {
        id: session.user.id,
        ...profile
      });

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

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
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
    </div>
  );
};

export default Profile;