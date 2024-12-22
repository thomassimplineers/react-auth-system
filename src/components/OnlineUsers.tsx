import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface OnlineUser {
  id: string;
  email: string;
  timestamp: string;
}

const OnlineUsers: React.FC = () => {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Update presence
      const presence = supabase.channel('online-users')
        .on('presence', { event: 'sync' }, () => {
          const presentUsers = presence.presenceState();
          setUsers(Object.values(presentUsers).flat() as OnlineUser[]);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presence.track({
              id: user.id,
              email: user.email,
              timestamp: new Date().toISOString(),
            });
          }
        });

      return () => {
        presence.unsubscribe();
      };
    }
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Online Users</h2>
      <div className="space-y-2">
        {users.map((onlineUser) => (
          <div
            key={onlineUser.id}
            className="flex items-center space-x-2 p-2 rounded-lg bg-white shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>
              {onlineUser.email}
              {onlineUser.id === user?.id && ' (You)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;