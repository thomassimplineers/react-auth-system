import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import ProfileForm from './ProfileForm';
import FeedEventHandler from '../../utils/FeedEventHandler';
import { ProfileData } from '../../types/profile';
import FplTeamOverview from '../Fpl/FplTeamOverview';
import FplSection from './FplSection';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    nickname: '',
    avatar_url: null,
    fpl_team_id: ''
  });
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        
        if (!user) throw new Error('No user');

        const { data, error } = await supabase
          .from('profiles')
          .select('email, nickname, nickname, avatar_url, fpl_team_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setEmail(data.email || '');
        setNickname(data.nickname || '');
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setMessage('');

      const updates = {
        id: user.id,
        nickname: profile.nickname?.trim(),
        avatar_url: profile.avatar_url,
        fpl_team_id: profile.fpl_team_id?.trim(),
        updated_at: new Date().toISOString()
      };

      console.log('Updating profile with:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updates)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Profile updated:', data);

      await FeedEventHandler.handleProfileUpdate(
        user.id,
        profile.nickname,
        profile.avatar_url,
        profile.fpl_team_id
      );

      setMessage('Profile updated successfully!');
      await fetchProfile();
    } catch (error) {
      console.error('Full error details:', error);
      setMessage(error instanceof Error ? error.message : 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        
        {/* Basic Profile Information */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">{email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nickname
              </label>
              <p className="mt-1 text-sm text-gray-900">{nickname || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* FPL Section */}
        <div className="border-t border-gray-200 pt-6">
          <FplSection />
        </div>
      </div>
    </div>
  );
};

export default Profile; 