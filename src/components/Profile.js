import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Input, Button } from '@supabase/ui-react';
import { User as IconUser } from 'lucide-react';

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
      <Card>
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <Input
              label="Email"
              value={session.user.email}
              disabled
              iconLeft={<IconUser size={16} />}
            />
          </div>

          <div>
            <Input
              label="Username"
              value={username || ''}
              onChange={(e) => setUsername(e.target.value)}
              iconLeft={<IconUser size={16} />}
            />
          </div>

          <div>
            <Input
              label="Avatar URL"
              type="url"
              value={avatar_url || ''}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <Button
            block
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;