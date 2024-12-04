import React from 'react';

const OnlineUsers = ({ userProfiles }) => {
  return (
    <div className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Online Users</h2>
      <div className="space-y-3">
        {Object.entries(userProfiles).map(([userId, profile]) => (
          <div key={userId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg">
                    {profile.nickname?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{profile.nickname}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;