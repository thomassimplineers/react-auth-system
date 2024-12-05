import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const OnlineUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      // Set initial online status
      if (user) {
        await supabase
          .from('user_status')
          .upsert({
            id: user.id,
            is_online: true,
            last_seen: new Date().toISOString()
          });
      }
    };
    getCurrentUser();

    // Fetch and subscribe to users
    const fetchUsers = async () => {
      const { data: statusData } = await supabase
        .from('user_status')
        .select(`
          id,
          is_online,
          last_seen,
          profiles:id (
            nickname,
            avatar_url
          )
        `);

      if (statusData) {
        setUsers(statusData);
      }
    };
    fetchUsers();

    // Subscribe to user_status changes
    const channel = supabase
      .channel('online-users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_status' },
        payload => {
          setUsers(currentUsers => {
            const index = currentUsers.findIndex(u => u.id === payload.new.id);
            if (index >= 0) {
              const newUsers = [...currentUsers];
              newUsers[index] = { ...newUsers[index], ...payload.new };
              return newUsers;
            }
            return [...currentUsers, payload.new];
          });
        }
      )
      .subscribe();

    // Update current user's status periodically
    const interval = setInterval(async () => {
      if (currentUser) {
        await supabase
          .from('user_status')
          .upsert({
            id: currentUser.id,
            is_online: true,
            last_seen: new Date().toISOString()
          });
      }
    }, 30000); // every 30 seconds

    // Cleanup
    return () => {
      clearInterval(interval);
      channel.unsubscribe();
      if (currentUser) {
        supabase
          .from('user_status')
          .upsert({
            id: currentUser.id,
            is_online: false,
            last_seen: new Date().toISOString()
          });
      }
    };
  }, [currentUser]);

  return (
    <div className="space-y-2">
      {users.map(user => (
        <div 
          key={user.id} 
          className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
              {user.profiles?.avatar_url ? (
                <img 
                  src={user.profiles.avatar_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg">
                  {user.profiles?.nickname?.[0] || '?'}
                </span>
              )}
            </div>
            <div 
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-300'}`}
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user.profiles?.nickname || 'Anonymous'}
              {user.id === currentUser?.id && ' (You)'}
            </p>
            <p className="text-xs text-gray-500">
              {user.is_online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnlineUsers;