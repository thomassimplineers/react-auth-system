import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.email}</h2>
            <p className="text-gray-500">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
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
              <label className="block text-sm font-medium text-gray-700">Last Sign In</label>
              <p className="mt-1">{new Date(user?.last_sign_in_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;