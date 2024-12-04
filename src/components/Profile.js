import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setNickname(profile.nickname);
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          nickname: nickname || user.email.split('@')[0]
        });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateNickname = async () => {
    try {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          nickname: nickname || user.email.split('@')[0],
          avatar_url: avatarUrl
        });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setError(error.message);
      setSaveStatus('');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-2xl">
                  {nickname?.[0] || user?.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
              <span className="text-sm">{uploading ? 'Uploading...' : 'Change'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nickname
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={user.email.split('@')[0]}
                />
                <button
                  onClick={handleUpdateNickname}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Account Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member since</label>
              <p className="mt-1">{new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;