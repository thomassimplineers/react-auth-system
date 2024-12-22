import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Menu: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Feed' },
    { path: '/chat', label: 'Chat' },
    { path: '/fpl', label: 'Fantasy PL' },
    { path: '/profile', label: 'Profil' }
  ];

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {user && menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                  isActive(item.path)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            {user ? (
              <button
                onClick={signOut}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logga ut
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logga in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
