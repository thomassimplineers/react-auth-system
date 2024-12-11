import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload } from 'lucide-react';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '',
    avatar_url: ''
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!session?.user?.id) return;
    loadProfile();
  }, [session?.user?.id]);

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

    fetchOnlineUsers();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      // Först hämta online users
      const { data: onlineUsersData, error: statusError } = await supabase
        .from('user_status')
        .select('id')
        .eq('is_online', true);

      if (statusError) throw statusError;

      if (onlineUsersData?.length) {
        // Sedan hämta deras profilinfo
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nickname')
          .in('id', onlineUsersData.map(user => user.id));

        if (profilesError) throw profilesError;

        const combinedData = onlineUsersData.map(user => ({
          ...user,
          nickname: profilesData.find(p => p.id === user.id)?.nickname || 'Anonymous'
        }));

        setOnlineUsers(combinedData);
      } else {
        setOnlineUsers([]);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
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

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setStatusMessage({ type: '', text: '' });

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl }, error: urlError } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setStatusMessage({
        type: 'success',
        text: 'Profile picture updated successfully!'
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setUploading(false);
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
    <div className="flex flex-col h-full p-4">
      <div className="flex-grow overflow-y-auto mb-4 bg-white shadow rounded-lg p-6">
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

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80';
                        setStatusMessage({
                          type: 'error',
                          text: 'Could not load profile picture'
                        });
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      className="hidden"
                      id="avatar-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {uploading ? 'Uploading...' : 'Upload Picture'}
                    </label>
                  </div>
                </div>
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

          <div className="col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Online Users</h3>
            <div className="space-y-2">
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">
                    {user.nickname}
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