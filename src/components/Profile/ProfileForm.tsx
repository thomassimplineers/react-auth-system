import React from 'react';
import AvatarUpload from './AvatarUpload';
import FplService from '../../services/fplService';

interface ProfileFormProps {
  profile: {
    nickname: string;
    avatar_url: string | null;
    fpl_team_id?: string;
  };
  loading: boolean;
  message: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (profile: any) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  loading,
  message,
  onSubmit,
  onChange
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="mb-6">
      <div className="flex items-center space-x-4">
        <AvatarUpload
          userId={profile.id}
          avatarUrl={profile.avatar_url}
          onUploadComplete={(url) => onChange({ ...profile, avatar_url: url })}
        />
        <div className="flex-1">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              Nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={profile.nickname}
              onChange={(e) => onChange({ ...profile, nickname: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your nickname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fantasy Premier League Team ID
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={profile.fpl_team_id || ''}
                onChange={(e) => onChange({ ...profile, fpl_team_id: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your FPL Team ID"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!profile.fpl_team_id) return;
                  
                  const result = await FplService.testConnection(profile.fpl_team_id);
                  if (result.success) {
                    alert(`FPL Team found: ${result.data.name}\nManager: ${result.data.player_first_name} ${result.data.player_last_name}`);
                  } else {
                    alert(`Error: ${result.error}`);
                  }
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Test ID
              </button>
            </div>
            <div className="mt-2 space-y-2 text-sm text-gray-500">
              <p>To find your FPL Team ID:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a 
                  href="https://fantasy.premierleague.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  fantasy.premierleague.com
                </a></li>
                <li>Log in to your account</li>
                <li>Go to the "Points" tab</li>
                <li>Look at the URL in your browser - your Team ID is the number at the end</li>
                <li>Example: https://fantasy.premierleague.com/entry/<span className="font-mono">1234567</span>/event/1</li>
              </ol>
              <p className="mt-2 italic">
                Note: Make sure to enter only the number, not the full URL
              </p>
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  </form>
);

export default ProfileForm; 