import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const UserStatus = ({ user, status }) => (
  <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-lg">
            {user.nickname?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${status ? 'bg-green-400' : 'bg-gray-300'}`}></div>
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900">{user.nickname}</p>
      <p className="text-xs text-gray-500">
        {status ? 'Online' : 'Offline'}
      </p>
    </div>
  </div>
);

const OnlineUsers = ({ userProfiles }) => {
  const [userStatuses, setUserStatuses] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Update current user's status
      if (user) {
        await supabase.from('user_status').upsert({
          id: user.id,
          is_online: true,
          last_seen: new Date().toISOString()
        });
      }
    };
    setupPresence();

    // Subscribe to status changes
    const channel = supabase
      .channel('online-users')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_status'
      }, payload => {
        setUserStatuses(current => ({
          ...current,
          [payload.new.id]: payload.new
        }));
      })
      .subscribe();

    // Fetch initial statuses
    const fetchStatuses = async () => {
      const { data } = await supabase
        .from('user_status')
        .select('*');
      
      if (data) {
        const statusMap = {};
        data.forEach(status => {
          statusMap[status.id] = status;
        });
        setUserStatuses(statusMap);
      }
    };
    fetchStatuses();

    // Update status periodically
    const updateInterval = setInterval(async () => {
      if (currentUser) {
        await supabase.from('user_status').upsert({
          id: currentUser.id,
          is_online: true,
          last_seen: new Date().toISOString()
        });
      }
    }, 30000); // Update every 30 seconds

    // Cleanup
    return () => {
      clearInterval(updateInterval);
      channel.unsubscribe();
      // Set offline status when leaving
      if (currentUser) {
        supabase.from('user_status').upsert({
          id: currentUser.id,
          is_online: false,
          last_seen: new Date().toISOString()
        });
      }
    };
  }, [currentUser]);

  const sortedUsers = Object.entries(userProfiles).sort((a, b) => {
    const aOnline = userStatuses[a[0]]?.is_online ?? false;
    const bOnline = userStatuses[b[0]]?.is_online ?? false;
    if (aOnline === bOnline) return 0;
    return aOnline ? -1 : 1;
  });

  return (
    <div className="space-y-2">
      {sortedUsers.map(([userId, profile]) => (
        <UserStatus 
          key={userId}
          user={profile}
          status={userStatuses[userId]?.is_online}
        />
      ))}
    </div>
  );
};

export default OnlineUsers;