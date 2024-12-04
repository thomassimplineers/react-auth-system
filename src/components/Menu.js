import { useState } from 'react';

const NavMenu = ({ setCurrentView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Chat', view: 'chat' },
    { name: 'Profile', view: 'profile' },
    { name: 'Statistics', view: 'stats' }
  ];

  const handleClick = (view) => {
    setCurrentView(view);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-blue-700 rounded-lg flex items-center"
      >
        <span className="text-white">☰</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleClick(item.view)}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavMenu;