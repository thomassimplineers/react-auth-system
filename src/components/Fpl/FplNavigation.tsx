import { NavLink } from 'react-router-dom';

const FplNavigation: React.FC = () => {
  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          <NavLink 
            to="/fpl"
            className={({ isActive }) => 
              `px-3 py-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/fpl/my-team"
            className={({ isActive }) => 
              `px-3 py-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            My Team
          </NavLink>
          <NavLink 
            to="/fpl/leagues"
            className={({ isActive }) => 
              `px-3 py-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Leagues
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default FplNavigation; 